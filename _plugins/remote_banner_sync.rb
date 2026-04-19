# frozen_string_literal: true

require 'yaml'
require 'open3'

# Runs after Google Docs post import (lower generator priority). Calls Node to
# download https featured-image URLs into assets/post-media/<slug>/ and patch
# _posts on disk, then refreshes in-memory post.data for files Jekyll already loaded.
module Jekyll
  class RemoteBannerSyncGenerator < Generator
    safe true
    priority :low

    def generate(site)
      return if site.config['remote_banner_sync_enabled'] == false
      return if ENV['SKIP_REMOTE_BANNER_SYNC'] == '1'

      script = File.expand_path('scripts/sync-remote-banner-images.mjs', site.source)
      unless File.file?(script)
        Jekyll.logger.info 'RemoteBannerSync:', 'scripts/sync-remote-banner-images.mjs missing; skip.'
        return
      end

      _chk, _err0, status = Open3.capture3('node', '-e', 'process.exit(0)')
      unless status.success?
        Jekyll.logger.warn 'RemoteBannerSync:', 'node not found; skip remote banner sync.'
        return
      end

      hosts = site.config['remote_banner_sync_allowed_hosts']
      sub_env = {}
      sub_env['REMOTE_BANNER_SYNC_ALLOWED_HOSTS'] = hosts.join(',') if hosts.is_a?(Array) && !hosts.empty?

      site_root = File.expand_path(site.source)
      out, err, st =
        if sub_env.empty?
          Open3.capture3('node', script, '--site-root', site_root)
        else
          Open3.capture3(sub_env, 'node', script, '--site-root', site_root)
        end
      Jekyll.logger.info 'RemoteBannerSync:', out.strip.gsub(/\n+/, ' | ') unless out.strip.empty?
      Jekyll.logger.warn 'RemoteBannerSync:', err.strip.gsub(/\n+/, ' | ') unless err.strip.empty?

      unless st.success?
        Jekyll.logger.error 'RemoteBannerSync:', 'sync-remote-banner-images.mjs failed'
        return
      end

      changed_file = File.join(site.source, '.jekyll-cache', 'remote_banner_changed.txt')
      return unless File.file?(changed_file)

      File.readlines(changed_file, chomp: true).each do |rel|
        next if rel.nil? || rel.strip.empty?

        abs = File.expand_path(rel.strip, site.source)
        refresh_document_data!(site, abs) if File.file?(abs)
      end
    rescue StandardError => e
      Jekyll.logger.warn 'RemoteBannerSync:', "#{e.class}: #{e.message}"
    end

    def refresh_document_data!(site, abs_path)
      coll = site.collections['posts']
      doc = coll.docs.find { |d| File.expand_path(d.path) == File.expand_path(abs_path) }
      return unless doc

      raw = File.read(abs_path, encoding: 'UTF-8')
      return unless raw.start_with?('---')

      fm_end = raw.index("\n---\n", 4)
      return unless fm_end

      yaml_str = raw[4...fm_end]
      data = YAML.safe_load(
        yaml_str,
        permitted_classes: [Date, Time],
        aliases: true
      )
      return unless data.is_a?(Hash)

      stringy = data.transform_keys(&:to_s)
      doc.merge_data!(stringy, source: 'remote_banner_sync')
      Jekyll.logger.info 'RemoteBannerSync:', "Refreshed in-memory data for #{doc.basename_without_ext}"
    end
  end
end
