# Google Apps Script Setup for Contact Form

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "VL Blog Contact Messages"
4. In the first row, add these headers:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Email`
   - D1: `Message`

## Step 2: Create Google Apps Script

1. In your Google Sheet, go to `Extensions` → `Apps Script`
2. Delete the default code and paste the following:

```javascript
function doPost(e) {
  try {
    // Parse the JSON data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();

    // Add the data to a new row
    sheet.appendRow([data.timestamp, data.name, data.email, data.message]);

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Step 3: Deploy the Script

1. Click `Deploy` → `New deployment`
2. Click the gear icon next to "Type" and select `Web app`
3. Set these options:
   - Description: "VL Blog Contact Form"
   - Execute as: "Me"
   - Who has access: "Anyone"
4. Click `Deploy`
5. Copy the web app URL (it will look like: `https://script.google.com/macros/s/...../exec`)

## Step 4: Update the Jekyll Site

1. In your `_layouts/default.html` file, find this line:

   ```javascript
   const response = await fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
   ```

2. Replace `YOUR_GOOGLE_APPS_SCRIPT_URL` with the URL you copied from step 3.

## Step 5: Test the Form

1. Load your Jekyll site
2. Click the "Talk to me!" button
3. Fill out the form and submit
4. Check your Google Sheet to see if the message was recorded

## Optional: Email Notifications

To get email notifications when someone submits the form, add this to your Apps Script:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Add to spreadsheet (existing code)
    const sheet = SpreadsheetApp.getActiveSheet();
    sheet.appendRow([data.timestamp, data.name, data.email, data.message]);

    // Send email notification
    MailApp.sendEmail({
      to: "mail@viktorlovgren.com",
      subject: "New Contact Form Submission - VL Blog",
      body: `
New message from your blog contact form:

Name: ${data.name}
Email: ${data.email}
Message: ${data.message}
Timestamp: ${data.timestamp}

You can view all messages in your Google Sheet.
      `,
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Troubleshooting

- If the form doesn't work, check the browser console for errors
- Make sure the Google Apps Script is deployed with "Anyone" access
- Test the script URL directly in your browser to see if it's accessible
- The spreadsheet must be accessible to the same Google account that created the script
