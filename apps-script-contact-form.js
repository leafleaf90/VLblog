function doPost(e) {
  try {
    // Parse the JSON data
    const data = JSON.parse(e.postData.contents);

    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();

    // Add the data to a new row
    sheet.appendRow([
      new Date(), // Current timestamp
      data.name,
      data.email,
      data.message,
    ]);

    // Optional: Send email notification
    MailApp.sendEmail({
      to: "mail@viktorlovgren.com",
      subject: "New Contact Form Submission - VL Blog",
      body: `
New message from your blog contact form:

Name: ${data.name}
Email: ${data.email}
Message: ${data.message}
Timestamp: ${new Date().toLocaleString()}

You can view all messages in your Google Sheet.
      `,
    });

    // Return success response with CORS headers
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      });
  } catch (error) {
    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    )
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      });
  }
}

// Handle preflight OPTIONS requests for CORS
function doOptions() {
  return ContentService.createTextOutput("").setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
}
