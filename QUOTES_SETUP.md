# Google Docs Quotes Integration Setup Guide

This guide will help you connect your published Google Docs with your favorite quotes to your Jekyll blog.

## 📋 Step 1: Prepare Your Google Doc

1. **Use your existing Google Doc** with your favorite quotes
2. **Format your quotes** in a consistent way. The plugin supports various formats:
   - `"Quote text" — Author`
   - `"Quote text" - Author, Source`
   - `Quote text (Author)`
   - `Quote text - Author`
   - `Quote text by Author`

### Example Quote Formats:

```
"The only way to do great work is to love what you do." — Steve Jobs

"Innovation distinguishes between a leader and a follower." - Steve Jobs

The future belongs to those who believe in the beauty of their dreams. (Eleanor Roosevelt)

Technology is best when it brings people together. - Matt Mullenweg, WordPress
```

## 🌐 Step 2: Publish Your Google Doc

1. In your Google Doc, click **"File" → "Share" → "Publish to web"**
2. Choose **"Document"** format
3. Click **"Publish"**
4. Copy the public URL (should look like: `https://docs.google.com/document/d/e/2PACX-...../pub`)

## ⚙️ Step 3: Configure Jekyll (Already Done!)

Your configuration is already set up in `_config.yml`:

```yaml
quotes_google_docs_url: "https://docs.google.com/document/d/e/2PACX-1vQQV8LAuvIYb1LOmPp8pe6cSJ83LKJ3wfq91lXDvR2oFnffzelX76yFm5S9Dr06Z5GNblIcft8dq_U4/pub"
```

## 🔧 Step 4: Install Dependencies

The system now uses Nokogiri to parse HTML. Install it:

```bash
bundle install
```

## 🚀 Step 5: Test the Integration

1. **Build your site**:

   ```bash
   bundle exec jekyll build
   ```

2. **Serve locally**:

   ```bash
   bundle exec jekyll serve
   ```

3. **Visit** `http://localhost:4000/quotes`

## 📝 Step 6: Add More Quotes

Simply edit your Google Doc:

- Add new quotes in the supported formats
- The changes will appear on your next site build
- No need to update your blog code!

## 🔍 Troubleshooting

### Quotes not showing?

1. **Check document is published**: Make sure you used "Publish to web", not just sharing
2. **Verify URL format**: Should end with `/pub`
3. **Check quote formatting**: Ensure quotes follow supported patterns
4. **Look at build logs**: Run `bundle exec jekyll build --verbose`

### Error messages during build?

- The plugin includes fallback quotes if Google Docs fails
- Check your internet connection
- Verify the document URL is correct and publicly accessible

### Quotes not being detected?

The plugin looks for these patterns:

- Text with quotation marks (`"` or `"`)
- Text with em dashes (`—`) or hyphens (`-`) followed by author names
- Text ending with `(Author)`
- Text with `by Author`
- Minimum 15 characters to avoid false positives

### Still having issues?

1. Check the Jekyll build output for error messages
2. Verify your document is publicly accessible
3. Try the fallback quotes first to ensure the page works
4. Check that quotes are formatted consistently

## 🎨 Customization

### Add more quote formats:

Edit `_plugins/google_docs_quotes.rb` and modify the parsing logic in `is_quote_text?` and extraction methods.

### Change styling:

Edit the CSS in `quotes.md` to match your blog's design.

### Modify layout:

The quotes page template is in `quotes.md` - customize as needed!

## 📱 Features Included

- ✅ Responsive design
- ✅ Quote statistics (total quotes, authors, last updated)
- ✅ Hover effects and animations
- ✅ Fallback quotes if Google Docs is unavailable
- ✅ Clean typography with quote marks
- ✅ Mobile-friendly layout
- ✅ Smart quote parsing from various formats
- ✅ Unicode character normalization

## 🔄 How It Works

1. **Build time**: Jekyll plugin fetches HTML from your published Google Doc
2. **Processing**: Parses HTML and extracts quotes using pattern matching
3. **Cleaning**: Normalizes unicode characters and formats
4. **Storage**: Saves quotes in `site.data.quotes`
5. **Display**: Quotes page renders all quotes with styling
6. **Caching**: Data is cached until next build

Your quotes will update automatically whenever you rebuild your site!

## 📖 Supported Quote Formats

The plugin intelligently detects and parses these quote formats:

| Format                | Example                                   |
| --------------------- | ----------------------------------------- |
| Standard with em dash | `"Quote text" — Author`                   |
| Hyphen format         | `"Quote text" - Author`                   |
| With source           | `"Quote text" - Author, Book Title`       |
| Parenthetical         | `Quote text (Author)`                     |
| By format             | `Quote text by Author`                    |
| Simple                | `"Quote text"` (author marked as Unknown) |

The system automatically extracts the quote text, author, and source (if present) from these formats.
