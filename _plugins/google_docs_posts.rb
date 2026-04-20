require 'json'
require 'yaml'
require 'fileutils'
require 'time'
require 'date'
require 'stringio'
require 'google/apis/drive_v3'
require 'googleauth'

module Jekyll
  class GoogleDocsPostsGenerator < Generator
    safe true
    priority :high

    def generate(site)
      config = site.config

      return unless config['google_docs_posts_enabled']

      folder_id = config['google_docs_posts_folder_id']
      service_account_json = config['google_docs_posts_service_account_json']
      cache_path = config['google_docs_posts_cache_path'] || '.jekyll-cache/google_docs_posts_cache.json'
      output_dir = config['google_docs_posts_output_dir'] || '_posts'

      if folder_id.to_s.strip.empty? || service_account_json.to_s.strip.empty?
        Jekyll.logger.warn 'GoogleDocs Posts:', 'Missing folder id or service account JSON path. Skipping import.'
        return
      end

      json_content = load_service_account_json(site.source, service_account_json)
      unless json_content
        Jekyll.logger.warn 'GoogleDocs Posts:', 'Service account JSON not found or invalid. Skipping import.'
        return
      end

      drive_service = build_drive_service(json_content)
      files = list_docs(drive_service, folder_id)

      cache = load_cache(site.source, cache_path)
      cache['docs'] ||= {}
      used_slugs = {}

      files.each do |file|
        doc_id = file.id
        modified_time = file.modified_time
        cached_entry = cache['docs'][doc_id]

        if cached_entry && cached_entry['modified_time'] && modified_time
          cached_time = Time.parse(cached_entry['modified_time']) rescue nil
          current_time = Time.parse(modified_time.to_s) rescue nil
          output_relative = cached_entry['output_path']
          output_path = output_relative ? File.expand_path(output_relative, site.source) : nil
          file_exists = output_path && File.exist?(output_path)
          cached_unpublished = cached_entry['unpublished']

          if cached_time && current_time && cached_time >= current_time && output_relative && (file_exists || cached_unpublished)
            Jekyll.logger.info 'GoogleDocs Posts:',
                               "Skipped #{output_relative} (drive modifiedTime not newer than cache; " \
                               "cached #{cached_entry['modified_time']}, drive #{modified_time}). " \
                               'Clear this doc in _data/google_docs_posts_cache.json to force re-export.'
            next
          end
        end

        markdown = export_markdown(drive_service, doc_id)
        unless markdown
          Jekyll.logger.warn 'GoogleDocs Posts:', "Failed to export markdown for #{doc_id}."
          next
        end

        front_matter = extract_front_matter(markdown, doc_id)
        unless front_matter
          next
        end

        data = front_matter[:data]
        slug = data['slug'].to_s.strip
        date = parse_date(data['date'])

        if slug.empty?
          Jekyll.logger.warn 'GoogleDocs Posts:', "Missing slug in doc #{doc_id}. Skipping."
          next
        end

        unless date
          Jekyll.logger.warn 'GoogleDocs Posts:', "Missing or invalid date in doc #{doc_id}. Skipping."
          next
        end

        if data.key?('published') && data['published'] == false
          output_filename = "#{date.strftime('%Y-%m-%d')}-#{slug}.md"
          output_relative = File.join(output_dir, output_filename)
          output_path = File.expand_path(output_relative, site.source)

          if File.exist?(output_path)
            FileUtils.rm_f(output_path)
            Jekyll.logger.info 'GoogleDocs Posts:',
                               "Removed #{output_relative} (doc #{doc_id} has published: false)."
          else
            Jekyll.logger.info 'GoogleDocs Posts:',
                               "Doc #{doc_id} is unpublished; no existing file at #{output_relative} to remove."
          end

          cache['docs'][doc_id] = {
            'modified_time' => modified_time.to_s,
            'slug' => slug,
            'output_path' => output_relative,
            'unpublished' => true
          }
          next
        end

        if used_slugs[slug]
          Jekyll.logger.warn 'GoogleDocs Posts:', "Duplicate slug '#{slug}' from doc #{doc_id}. Skipping."
          next
        end
        used_slugs[slug] = true

        output_filename = "#{date.strftime('%Y-%m-%d')}-#{slug}.md"
        output_relative = File.join(output_dir, output_filename)
        output_path = File.expand_path(output_relative, site.source)

        FileUtils.mkdir_p(File.dirname(output_path))
        clean_md = compose_clean_post_markdown(markdown)
        out = normalize_markdown(clean_md || markdown)
        unless jekyll_front_matter_delimited?(out)
          Jekyll.logger.warn 'GoogleDocs Posts:',
                             "Refusing to write #{output_relative}: missing a valid Jekyll front matter block " \
                             '(need a line that is only `---`, then YAML, then another line that is only `---`, ' \
                             'then the post body). The Drive export is malformed; fix the Doc or closing delimiter.'
          next
        end

        File.write(output_path, out)

        cache['docs'][doc_id] = {
          'modified_time' => modified_time.to_s,
          'slug' => slug,
          'output_path' => output_relative,
          'unpublished' => false
        }

        Jekyll.logger.info 'GoogleDocs Posts:', "Wrote #{output_relative} from doc #{doc_id}."
      end

      save_cache(site.source, cache_path, cache)
    rescue StandardError => e
      Jekyll.logger.warn 'GoogleDocs Posts:', "Failed to import posts: #{e.class.name} - #{e.message}"
    end

    private

    def load_service_account_json(site_source, config_value)
      env_json = ENV['GOOGLE_DOCS_POSTS_SERVICE_ACCOUNT_JSON']
      json_source = env_json.nil? || env_json.strip.empty? ? config_value : env_json
      json_source = json_source.to_s.strip

      return nil if json_source.empty?

      if json_source.start_with?('{')
        json_source
      else
        json_path = File.expand_path(json_source, site_source)
        return nil unless File.exist?(json_path)

        File.read(json_path)
      end
    rescue StandardError
      nil
    end

    def build_drive_service(json_content)
      credentials = Google::Auth::ServiceAccountCredentials.make_creds(
        json_key_io: StringIO.new(json_content),
        scope: [Google::Apis::DriveV3::AUTH_DRIVE_READONLY]
      )
      credentials.fetch_access_token!

      drive_service = Google::Apis::DriveV3::DriveService.new
      drive_service.authorization = credentials
      drive_service
    end

    def list_docs(drive_service, folder_id)
      files = []
      page_token = nil
      query = "'#{folder_id}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false"

      loop do
        response = drive_service.list_files(
          q: query,
          fields: 'nextPageToken, files(id, name, modifiedTime)',
          page_token: page_token
        )
        files.concat(response.files)
        page_token = response.next_page_token
        break if page_token.nil?
      end

      files
    end

    def export_markdown(drive_service, doc_id)
      output = StringIO.new
      drive_service.export_file(doc_id, 'text/markdown', download_dest: output)
      output.rewind
      output.read
    rescue StandardError
      nil
    end

    def extract_front_matter(markdown, doc_id = nil)
      # Google Docs / Windows exports: BOM, CRLF, blank lines before ---, curly quotes in YAML,
      # body flush against closing ---, or --- drawn with special dash characters.
      text = normalize_exported_markdown(markdown.to_s.dup)
      yaml_raw, fm_reason = slice_yaml_front_matter_block(text)
      unless yaml_raw
        preview = text[0, 400].gsub("\n", ' \\n ')
        hint = if text.lstrip.start_with?('#')
                 ' This Doc’s export starts with a Markdown heading — in Google Docs, move the YAML block to the **very top** of the document (above the title), beginning with a line that is only `---`.'
               else
                 ''
               end
        Jekyll.logger.warn 'GoogleDocs Posts:',
                           "Doc #{doc_id || 'unknown'}: #{fm_reason}. " \
                           "Fix: two lines that are only `---` (three hyphens), with YAML between.#{hint} " \
                           "Export preview: #{preview.inspect}"
        return nil
      end

      yaml_normalized = normalize_google_docs_yaml(yaml_raw)
      data = YAML.safe_load(yaml_normalized) || {}
      {
        data: data,
        raw: "---\n#{yaml_raw}\n---\n"
      }
    rescue Psych::SyntaxError => e
      numbered = yaml_normalized.to_s.lines.take(25).map.with_index(1) { |l, i| format('%2d|%s', i, l.chomp) }
      Jekyll.logger.warn 'GoogleDocs Posts:',
                         "Invalid YAML in doc #{doc_id || 'unknown'} front matter: #{e.message} " \
                         '(use straight ASCII quotes " in values; avoid smart quotes from Google Docs). Skipping.'
      Jekyll.logger.warn 'GoogleDocs Posts:', "Front matter YAML (first 25 lines):\n#{numbered.join("\n")}"
      nil
    rescue StandardError => e
      Jekyll.logger.warn 'GoogleDocs Posts:',
                         "Front matter error in doc #{doc_id || 'unknown'}: #{e.class.name} - #{e.message}. Skipping."
      nil
    end

    def normalize_exported_markdown(text)
      text.sub!(/\A\uFEFF/, '')
      text.gsub!("\r\n", "\n")
      # Strip leading blank / invisible-only lines so --- can be first real content
      text.sub!(/\A(?:[ \t\u00A0\u200B-\u200D\uFEFF]*\n)+/, '')
      # Drive "text/markdown" export often escapes HR as "\---" (backslash + hyphens), not a real --- line
      text.gsub!(/^[ \t]*\\+[\u002d\u2013\u2014\u2212]{3,}[ \t]*$/m, "---\n")
      # Drive often glues the closing fence to the previous line after long quoted URLs, e.g.
      #   featured-thumbnail: "https://...%3D%3D"---
      # so it is never a dash-only line and Jekyll renders the whole file as body.
      split_glued_yaml_closing_fence!(text)
      text
    end

    # Split `"...---` onto two lines so fm_delimiter_indices can find the closing ---.
    def split_glued_yaml_closing_fence!(text)
      text.gsub!(
        /^([A-Za-z0-9_.-]+:\s*"(?:[^"\\]|\\.)*")\s*(---)\s*$/m,
        "\\1\n\\2"
      )
      text.gsub!(
        /^([A-Za-z0-9_.-]+:\s*'(?:[^'\\]|\\.)*')\s*(---)\s*$/m,
        "\\1\n\\2"
      )
      text.gsub!(
        /^([A-Za-z0-9_.-]+:\s*\[[^\]]*\])\s*(---)\s*$/m,
        "\\1\n\\2"
      )
    end

    # True if the line is only "dashes" (Docs may insert spaces: "- - -" or use en/em dash).
    def dash_only_line?(line)
      s = line.strip.gsub(/[\s\u00A0\u200B-\u200D\uFEFF]+/, '')
      return false if s.length < 3

      s.match?(/\A[\u002D\u2013\u2014\u2212]+\z/)
    end

    # Line indices of opening and closing --- delimiters, or nil if invalid.
    def fm_delimiter_indices(lines)
      start_idx = nil
      lines.each_with_index do |line, i|
        next unless dash_only_line?(line)

        start_idx = i
        break
      end
      return nil unless start_idx

      end_idx = nil
      ((start_idx + 1)...lines.length).each do |j|
        next unless dash_only_line?(lines[j])

        end_idx = j
        break
      end
      return nil unless end_idx

      [start_idx, end_idx]
    end

    # Returns [yaml_inner_string, :ok] or [nil, reason_symbol_string]
    def slice_yaml_front_matter_block(text)
      lines = text.lines
      return [nil, 'empty export'] if lines.empty?

      range = fm_delimiter_indices(lines)
      unless range
        return [nil, 'no line of only --- (use three hyphens on one line; avoid smart lists splitting them)']
      end

      start_idx, end_idx = range
      inner = lines[(start_idx + 1)...end_idx].join
      return [nil, 'nothing between opening --- and closing ---'] if inner.strip.empty?

      [inner, :ok]
    end

    # Rewrite Drive export so written _posts/*.md has real --- and unescaped YAML (Jekyll requirement).
    def compose_clean_post_markdown(markdown)
      text = normalize_exported_markdown(markdown.to_s.dup)
      lines = text.lines
      range = fm_delimiter_indices(lines)
      return nil unless range

      start_idx, end_idx = range
      inner = lines[(start_idx + 1)...end_idx].join
      return nil if inner.strip.empty?

      yaml_clean = normalize_google_docs_yaml(inner)
      yaml_clean.sub!(/\A\n+/, '') # avoid `---` then blank lines before first key (some parsers are picky)
      body = lines[(end_idx + 1)..-1].join
      "---\n#{yaml_clean}\n---\n#{body}"
    end

    def normalize_google_docs_yaml(yaml_string)
      s = yaml_string.dup
      # Drive's text/markdown export can add backslashes before URL punctuation inside
      # double-quoted scalars (e.g. \%3D). Those are invalid YAML escapes and Psych aborts.
      s.gsub!(/\\([%#&?=()])/, '\1')
      # Docs often style the first line as Heading 2 → "## title:" breaks YAML
      s.gsub!(/^##\s+(?=[A-Za-z0-9_-]+\s*:)/, '')
      # Markdown link pasted into a YAML value: [url](url) → use the target URL
      s.gsub!(/\[https?:\/\/[^\]\s]+\]\((https?:\/\/[^)]+)\)/, '\1')
      # Curly / typographic quotes break Psych in many Google Doc exports
      s.tr!("\u201C\u201D", '"') # " "
      s.tr!("\u2018\u2019", "'") # ' '
      s.gsub!("\u00A0", ' ')
      # Drive export escapes underscores in keys (is\_series → is_series)
      s.gsub!('\_', '_')
      # And escapes brackets / quotes in YAML-looking lines (categories: \[\"a\"\])
      s.gsub!('\[', '[')
      s.gsub!('\]', ']')
      s.gsub!('\"', '"')
      s
    end

    def parse_date(value)
      return value.to_date if value.respond_to?(:to_date)
      Date.parse(value.to_s)
    rescue StandardError
      nil
    end

    def normalize_markdown(markdown)
      md = markdown.to_s.gsub("\r\n", "\n")
      md.sub!(/\A[\s\uFEFF]+/, '')
      md.rstrip!
      md << "\n"
    end

    # True if the file has Jekyll-style delimiters: ---, YAML, ---, then body (body may be empty).
    def jekyll_front_matter_delimited?(text)
      t = text.to_s.gsub(/\r\n/, "\n").sub(/\A\uFEFF/, '')
      return false unless t.start_with?("---\n")

      return true if t.index("\n---\n", 4)

      # Closing --- at EOF with no trailing newline after it (Drive / tooling edge case)
      !!(t =~ /\A---\n([\s\S]*?)\n---\s*\z/m)
    end

    def load_cache(site_source, cache_path)
      full_path = File.expand_path(cache_path, site_source)
      return {} unless File.exist?(full_path)

      JSON.parse(File.read(full_path))
    rescue StandardError
      {}
    end

    def save_cache(site_source, cache_path, cache)
      full_path = File.expand_path(cache_path, site_source)
      FileUtils.mkdir_p(File.dirname(full_path))
      File.write(full_path, JSON.pretty_generate(cache))
    end
  end
end
