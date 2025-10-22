require 'net/http'
require 'uri'
require 'nokogiri'
require 'json'

module Jekyll
  class GoogleDocsQuotesGenerator < Generator
    safe true
    priority :high

    def generate(site)
      # Configuration - you'll need to set this in _config.yml
      docs_url = site.config['quotes_google_docs_url']
      
      return unless docs_url

      timestamp = Time.now.strftime("%H:%M:%S")
      Jekyll.logger.info "GoogleDocs Quotes:", "[#{timestamp}] Starting quotes generation"

      begin
        result = fetch_quotes_from_google_docs(docs_url)
        quotes = result[:quotes]
        raw_html = result[:raw_html]
        
        # Store quotes and raw data in site.data for use in templates
        site.data['quotes'] = quotes
        site.data['quotes_by_topic'] = @quotes_by_topic || {}
        site.data['quotes_raw_html'] = raw_html
        
        Jekyll.logger.info "GoogleDocs Quotes:", "[#{timestamp}] Successfully loaded #{quotes.length} quotes from Google Docs"
        Jekyll.logger.info "GoogleDocs Quotes:", "[#{timestamp}] Set site.data['quotes'] with #{site.data['quotes'].length} items"
        Jekyll.logger.info "GoogleDocs Quotes:", "[#{timestamp}] Set site.data['quotes_by_topic'] with #{site.data['quotes_by_topic'].keys.length} topics"
        Jekyll.logger.info "GoogleDocs Quotes:", "Topics found: #{(@quotes_by_topic || {}).keys.join(', ')}"
        (@quotes_by_topic || {}).each do |topic, topic_quotes|
          Jekyll.logger.info "GoogleDocs Quotes:", "  #{topic}: #{topic_quotes.length} quotes"
        end
        
      rescue Net::TimeoutError => e
        Jekyll.logger.warn "GoogleDocs Quotes:", "[#{timestamp}] Timeout error: #{e.message}"
        Jekyll.logger.warn "GoogleDocs Quotes:", "Google Docs request timed out, using fallback quotes"
        
        # Use fallback quotes for timeout
        fallback_quotes_by_topic = get_fallback_quotes
        fallback_quotes_flat = fallback_quotes_by_topic.values.flatten
        
        site.data['quotes'] = fallback_quotes_flat
        site.data['quotes_by_topic'] = fallback_quotes_by_topic
        site.data['quotes_raw_html'] = "<p>Timeout error - using fallback quotes</p>"
        
      rescue => e
        Jekyll.logger.warn "GoogleDocs Quotes:", "[#{timestamp}] Failed to fetch quotes: #{e.class.name} - #{e.message}"
        Jekyll.logger.warn "GoogleDocs Quotes:", "Using fallback quotes"
        
        # Fallback to some sample quotes if the fetch fails
        fallback_quotes_by_topic = get_fallback_quotes
        fallback_quotes_flat = fallback_quotes_by_topic.values.flatten
        
        site.data['quotes'] = fallback_quotes_flat
        site.data['quotes_by_topic'] = fallback_quotes_by_topic
        site.data['quotes_raw_html'] = "<p>Error occurred - using fallback quotes</p>"
      end
    end

    private

    def get_fallback_quotes
      {
        'Wisdom' => [
          {
            'text' => 'The only true wisdom is in knowing you know nothing.',
            'author' => 'Socrates',
            'topic' => 'Wisdom'
          },
          {
            'text' => 'It is better to remain silent at the risk of being thought a fool, than to talk and remove all doubt of it.',
            'author' => 'Maurice Switzer',
            'topic' => 'Wisdom'
          }
        ],
        'Success' => [
          {
            'text' => 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
            'author' => 'Winston Churchill',
            'topic' => 'Success'
          },
          {
            'text' => 'The way to get started is to quit talking and begin doing.',
            'author' => 'Walt Disney',
            'topic' => 'Success'
          }
        ]
      }
    end

    def fetch_quotes_from_google_docs(docs_url)
      Jekyll.logger.info "GoogleDocs Quotes:", "Fetching from: #{docs_url}"
      
      uri = URI(docs_url)
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      
      # Set timeouts to prevent hanging
      http.open_timeout = 10  # 10 seconds to open connection
      http.read_timeout = 30  # 30 seconds to read response
      
      # Disable SSL verification in development to avoid certificate issues
      http.verify_mode = OpenSSL::SSL::VERIFY_NONE
      
      request = Net::HTTP::Get.new(uri)
      
      Jekyll.logger.info "GoogleDocs Quotes:", "Making HTTP request..."
      response = http.request(request)
      Jekyll.logger.info "GoogleDocs Quotes:", "Response received: #{response.code}"
      
      unless response.code == '200'
        raise "HTTP Error: #{response.code} #{response.message}"
      end

      # Properly handle encoding from Google Docs
      body = response.body
      body.force_encoding('UTF-8')
      body = body.encode('UTF-8', 'UTF-8', invalid: :replace, undef: :replace, replace: '')
      
      # Parse the HTML content with proper encoding
      doc = Nokogiri::HTML(body, nil, 'UTF-8')
      quotes = parse_quotes_from_html(doc)
      
      Jekyll.logger.info "GoogleDocs Quotes:", "Parsed #{quotes.length} quotes from document"
      
      # Return both quotes and raw HTML for debugging
      {
        quotes: quotes.shuffle, # Randomize order for variety
        raw_html: body
      }
    end

    def parse_quotes_from_html(doc)
      quotes_by_topic = {}
      current_topic = "General"
      quotes = []
      
      Jekyll.logger.info "GoogleDocs Quotes:", "Starting to parse HTML content..."
      
      # Get all elements (both H1 and P) in document order
      all_elements = doc.css('h1, p')
      
      Jekyll.logger.info "GoogleDocs Quotes:", "Found #{all_elements.length} elements to process (H1 + P tags)"
      
      # Add timeout protection
      start_time = Time.now
      max_processing_time = 30 # 30 seconds max
      
      i = 0
      processed_count = 0
      while i < all_elements.length
        # Check for timeout
        if Time.now - start_time > max_processing_time
          Jekyll.logger.warn "GoogleDocs Quotes:", "Parsing timeout after #{max_processing_time} seconds. Processed #{processed_count}/#{all_elements.length} elements."
          break
        end
        
        element = all_elements[i]
        text = element.text.strip
        
        # Clean up encoding issues from Google Docs
        text = clean_text_encoding(text)
        
        # Always increment i to avoid infinite loop
        i += 1
        processed_count += 1
        
        # Skip empty elements
        if text.empty?
          next
        end
        
        # Add progress logging every 50 elements
        if processed_count % 50 == 0
          Jekyll.logger.info "GoogleDocs Quotes:", "Processed #{processed_count}/#{all_elements.length} elements..."
        end
        
        # Check if this is an H1 (topic header)
        if element.name == 'h1'
          current_topic = clean_text_encoding(text)
          quotes_by_topic[current_topic] ||= []
          Jekyll.logger.info "GoogleDocs Quotes:", "Found topic: #{current_topic}"
          next
        end
        
        # Process paragraph elements
        if element.name == 'p'
          Jekyll.logger.info "GoogleDocs Quotes:", "Processing paragraph under '#{current_topic}': '#{text.length > 50 ? text[0..50] + '...' : text}'"
        # Check if this is a structured quote starting with "Quote:"
        if text.start_with?('Quote:')
          Jekyll.logger.info "GoogleDocs Quotes:", "Found quote start: '#{text.length > 50 ? text[0..50] + '...' : text}'"
          
          # Extract quote text
          quote_text = clean_text_encoding(text.sub(/^Quote:\s*/, '').strip)
          
          # Look for the next elements: By, Context, URL
          by_text = nil
          context_text = nil
          url_text = nil
          
          # Check next elements for "By:"
          if i < all_elements.length
            next_element = all_elements[i]
            next_text = clean_text_encoding(next_element.text.strip)
            Jekyll.logger.info "GoogleDocs Quotes:", "Next element (By): '#{next_text.length > 50 ? next_text[0..50] + '...' : next_text}'"
            
            if next_text.start_with?('By:')
              by_text = clean_text_encoding(next_text.sub(/^By:\s*/, '').strip)
              
              # Check element after that for Context or URL
              if i + 1 < all_elements.length
                third_element = all_elements[i + 1]
                third_text = clean_text_encoding(third_element.text.strip)
                Jekyll.logger.info "GoogleDocs Quotes:", "Element +2 (Context?): '#{third_text.length > 50 ? third_text[0..50] + '...' : third_text}'"
                
                if third_text.start_with?('Context:')
                  context_text = clean_text_encoding(third_text.sub(/^Context:\s*/, '').strip)
                  
                  # Check next element for URL
                  if i + 2 < all_elements.length
                    fourth_element = all_elements[i + 2]
                    fourth_text = clean_text_encoding(fourth_element.text.strip)
                    Jekyll.logger.info "GoogleDocs Quotes:", "Element +3 (URL?): '#{fourth_text.length > 50 ? fourth_text[0..50] + '...' : fourth_text}'"
                    
                    if fourth_text.start_with?('URL:')
                      url_text = clean_text_encoding(fourth_text.sub(/^URL:\s*/, '').strip)
                    end
                  end
                elsif third_text.start_with?('URL:')
                  url_text = clean_text_encoding(third_text.sub(/^URL:\s*/, '').strip)
                end
              end
            end
          end
          
          # Create quote object if we have the minimum required fields
          if quote_text && by_text
            quote = {
              'text' => quote_text,
              'author' => by_text,
              'topic' => current_topic
            }
            
            quote['context'] = context_text if context_text && !context_text.empty?
            quote['url'] = url_text if url_text && !url_text.empty?
            
            quotes << quote
            quotes_by_topic[current_topic] ||= []
            quotes_by_topic[current_topic] << quote
            
            Jekyll.logger.info "GoogleDocs Quotes:", "Found structured quote under #{current_topic}: '#{quote_text.length > 50 ? quote_text[0..50] + '...' : quote_text}' by #{by_text}"
            Jekyll.logger.info "GoogleDocs Quotes:", " Context: #{context_text}" if context_text
            Jekyll.logger.info "GoogleDocs Quotes:", " URL: #{url_text}" if url_text
            
            # Skip the elements we already processed
            skip_count = 1 # Skip the "By:" element
            skip_count += 1 if context_text # Skip the "Context:" element
            skip_count += 1 if url_text # Skip the "URL:" element
            
            i += skip_count
            processed_count += skip_count
            Jekyll.logger.info "GoogleDocs Quotes:", "Skipping #{skip_count} processed elements"
          end
        end
        end
      end
      
      @quotes_by_topic = quotes_by_topic
      
      Jekyll.logger.info "GoogleDocs Quotes:", "Final count: #{quotes.length} quotes in #{quotes_by_topic.keys.length} topics"
      
      quotes
    end

    private

    def clean_text_encoding(text)
      return text unless text
      
      text.strip
        .gsub(/â/, "'")          # Fix apostrophes (â → ')
        .gsub(/â/, '"')          # Fix opening quotes (â → ")
        .gsub(/â/, '"')          # Fix closing quotes (â → ")
        .gsub(/â/, '–')          # Fix en dashes (â → –)
        .gsub(/âs/, "'s")        # Fix possessive (âs → 's)
        .gsub(/âre/, "'re")      # Fix contractions (âre → 're)
        .gsub(/âve/, "'ve")      # Fix contractions (âve → 've)
        .gsub(/ât/, "'t")        # Fix contractions (ât → 't)
        .gsub(/âll/, "'ll")      # Fix contractions (âll → 'll)
        .gsub(/âd/, "'d")        # Fix contractions (âd → 'd)
        .gsub(/â¦/, '…')          # Fix ellipsis (â¦ → …)
        .gsub(/Ã¡/, 'á')         # Fix á character
        .gsub(/Ã©/, 'é')         # Fix é character
        .gsub(/Ã­/, 'í')         # Fix í character
        .gsub(/Ã³/, 'ó')         # Fix ó character
        .gsub(/Ãº/, 'ú')         # Fix ú character
        .gsub(/Ã±/, 'ñ')         # Fix ñ character
        .gsub(/Ã¤/, 'ä')         # Fix ä character
        .gsub(/Ã¶/, 'ö')         # Fix ö character
        .gsub(/Ã¼/, 'ü')         # Fix ü character
        .gsub(/Ã/, 'À')          # Fix À character
        .gsub(/Ã¢/, 'â')         # Fix â character
        .gsub(/Ã§/, 'ç')         # Fix ç character
        .gsub(/\s+/, ' ')        # Normalize whitespace
    end
  end
end