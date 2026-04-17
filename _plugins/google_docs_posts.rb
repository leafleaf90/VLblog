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

          if cached_time && current_time && cached_time >= current_time && output_path && File.exist?(output_path)
            next
          end
        end

        markdown = export_markdown(drive_service, doc_id)
        unless markdown
          Jekyll.logger.warn 'GoogleDocs Posts:', "Failed to export markdown for #{doc_id}."
          next
        end

        front_matter = extract_front_matter(markdown)
        unless front_matter
          Jekyll.logger.warn 'GoogleDocs Posts:', "Missing front matter in doc #{doc_id}. Skipping."
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
          Jekyll.logger.info 'GoogleDocs Posts:', "Doc #{doc_id} is unpublished. Skipping."
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
        File.write(output_path, normalize_markdown(markdown))

        cache['docs'][doc_id] = {
          'modified_time' => modified_time.to_s,
          'slug' => slug,
          'output_path' => output_relative
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

    def extract_front_matter(markdown)
      return nil unless markdown.start_with?('---')

      match = markdown.match(/\A---\s*\n(.*?)\n---\s*\n/m)
      return nil unless match

      data = YAML.safe_load(match[1]) || {}
      {
        data: data,
        raw: match[0]
      }
    rescue StandardError
      nil
    end

    def parse_date(value)
      return value.to_date if value.respond_to?(:to_date)
      Date.parse(value.to_s)
    rescue StandardError
      nil
    end

    def normalize_markdown(markdown)
      normalized = markdown.strip
      normalized << "\n" unless normalized.end_with?("\n")
      normalized
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
