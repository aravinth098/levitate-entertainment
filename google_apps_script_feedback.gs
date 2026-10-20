/**
 * ============================================================================
 * LEVITATE ENTERTAINMENT — RIMI TOMY LIVE CANADA 2026
 * Google Apps Script for Real-Time Event Feedback Collection & Automated Emails
 * Matches Official Attendee Feedback Questionnaire (14 Questions + Contacts)
 * ============================================================================
 */

const SHEET_NAME = "Rimi Tomy Feedback";
const ADMIN_EMAIL = "websitelevitate.inc@gmail.com";
const SENDER_NAME = "Levitate Entertainment";

/**
 * Handle HTTP GET Requests (Health Check)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    service: "Levitate Event Feedback Web App",
    sheet: SHEET_NAME,
    adminEmail: ADMIN_EMAIL,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests (Appends new row & sends email notifications)
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(15000); // 15s lock to prevent concurrent write collisions

  try {
    var sheet = getOrCreateFeedbackSheet();
    var data = {};

    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var now = new Date();
    var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone() || "America/Toronto", "yyyy-MM-dd HH:mm:ss");

    var eventTitle = data.eventTitle || "Rimi Tomy Live Canada 2026";
    var q1 = data.cityAttended || data.city || "";
    var q2 = data.overallExperience || "";
    var q3 = data.ticketingPlatform || "";
    var q4 = data.enjoyedMost || "";
    var q5 = data.improveAreas || "";
    var q6 = data.oneThingBetter || "";
    var q7 = data.artistNext || "";
    var q8 = data.eventsInterest2027 || "";
    var q9 = data.attendAgain || "";
    var q10 = data.recommendScore ? String(data.recommendScore) + " / 10" : "";
    var q11 = data.heardFrom || "";
    var q11Other = data.heardFromOther || "";
    var q12 = data.updatesCurrent || "";
    var q13 = data.updatesPreferred || "";
    var q14 = data.involvementInterest || "";

    var attendeeName = data.attendeeName ? data.attendeeName.trim() : "Anonymous";
    var attendeeEmail = data.attendeeEmail ? data.attendeeEmail.trim() : "";
    var attendeePhone = data.attendeePhone ? data.attendeePhone.trim() : "";
    var marketingConsent = data.marketingConsent || "No";

    // 21 Column Row
    var row = [
      formattedDate,
      eventTitle,
      q1,
      q2,
      q3,
      q4,
      q5,
      q6,
      q7,
      q8,
      q9,
      q10,
      q11,
      q11Other,
      q12,
      q13,
      q14,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      marketingConsent
    ];

    sheet.appendRow(row);
    var lastRowIndex = sheet.getLastRow();

    // Alternating row styling
    var rowRange = sheet.getRange(lastRowIndex, 1, 1, row.length);
    if (lastRowIndex % 2 === 0) {
      rowRange.setBackground("#f9fafb");
    } else {
      rowRange.setBackground("#ffffff");
    }

    // ------------------------------------------------------------------------
    // EMAIL NOTIFICATIONS (Safe Execution - Never blocks sheet write)
    // ------------------------------------------------------------------------
    var feedbackDetails = {
      timestamp: formattedDate,
      eventTitle: eventTitle,
      q1: q1,
      q2: q2,
      q3: q3,
      q4: q4,
      q5: q5,
      q6: q6,
      q7: q7,
      q8: q8,
      q9: q9,
      q10: q10,
      q11: q11,
      q11Other: q11Other,
      q12: q12,
      q13: q13,
      q14: q14,
      attendeeName: attendeeName,
      attendeeEmail: attendeeEmail,
      attendeePhone: attendeePhone,
      marketingConsent: marketingConsent,
      rowIndex: lastRowIndex
    };

    // 1. Send Admin Alert Email
    try {
      sendAdminNotification(feedbackDetails);
    } catch (adminMailErr) {
      console.error("Error sending admin notification email: " + adminMailErr.toString());
    }

    // 2. Send Attendee Confirmation Email (if valid email provided)
    if (attendeeEmail && attendeeEmail.indexOf("@") > 0) {
      try {
        sendAttendeeConfirmation(feedbackDetails);
      } catch (userMailErr) {
        console.error("Error sending attendee confirmation email: " + userMailErr.toString());
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Feedback recorded in Sheet and emails dispatched!",
      row: lastRowIndex,
      timestamp: formattedDate
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

/**
 * Sends real-time notification to websitelevitate.inc@gmail.com
 */
function sendAdminNotification(f) {
  var subject = "Feedback Submission: " + (f.q1 || "Concert") + " - " + f.attendeeName;

  var htmlBody = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0c0d12; color: #f3f4f6; border-radius: 12px; overflow: hidden; border: 1px solid #232733;">
    <div style="background: linear-gradient(135deg, #1f1b2e 0%, #11131a 100%); padding: 24px; border-bottom: 2px solid #F59E0B;">
      <h2 style="margin: 0 0 6px 0; color: #ffffff; font-size: 20px;">New Feedback Received</h2>
      <p style="margin: 0; color: #F59E0B; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase;">
        ${f.eventTitle} &bull; ${escapeHtml(f.q1)}
      </p>
    </div>

    <div style="padding: 24px;">
      <!-- Attendee Information -->
      <div style="background-color: #171a23; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
        <h4 style="margin: 0 0 10px 0; color: #F59E0B; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Attendee Details</h4>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Name:</strong> ${escapeHtml(f.attendeeName)}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Email:</strong> ${f.attendeeEmail ? escapeHtml(f.attendeeEmail) : '<span style="color: #6b7280;">Not provided</span>'}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Phone:</strong> ${f.attendeePhone ? escapeHtml(f.attendeePhone) : '<span style="color: #6b7280;">Not provided</span>'}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Marketing Updates Consent:</strong> ${escapeHtml(f.marketingConsent)}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Time:</strong> ${f.timestamp}</p>
      </div>

      <!-- Quick Ratings Overview -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af; width: 45%;"><strong>Q1: City Attended</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #ffffff; font-weight: bold;">${escapeHtml(f.q1)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q2: Overall Experience</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #F59E0B; font-weight: bold;">${escapeHtml(f.q2)}</td>
        </tr>
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q3: Ticketing Platform</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q3 || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q4: Enjoyed Most</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q4 || 'N/A')}</td>
        </tr>
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q5: Areas to Improve</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #fca5a5;">${escapeHtml(f.q5 || 'None')}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q8: 2027 Events Interest</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q8 || 'N/A')}</td>
        </tr>
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q9: Attend Another Event?</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #10b981; font-weight: bold;">${escapeHtml(f.q9)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q10: Recommend Score (NPS)</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #38bdf8; font-weight: bold;">${escapeHtml(f.q10)}</td>
        </tr>
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q11: Heard About Live</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q11)} ${f.q11Other ? '(' + escapeHtml(f.q11Other) + ')' : ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q12: Current Updates</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q12 || 'N/A')}</td>
        </tr>
        <tr style="background-color: #171a23;">
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q13: Preferred Updates</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q13 || 'N/A')}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #9ca3af;"><strong>Q14: 2027 Involvement</strong></td>
          <td style="padding: 10px; border: 1px solid #282d3b; color: #e2e8f0;">${escapeHtml(f.q14 || 'N/A')}</td>
        </tr>
      </table>

      <!-- Open-ended feedback -->
      ${f.q6 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #171a23; border-radius: 6px;">
        <div style="color: #F59E0B; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q6: ONE Thing We Could Do Better:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q6)}"</div>
      </div>` : ''}

      ${f.q7 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #171a23; border-radius: 6px;">
        <div style="color: #F59E0B; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q7: Artist Desired Next:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q7)}"</div>
      </div>` : ''}

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://levitateinc.ca/admin" style="background: #F59E0B; color: #0c0d12; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 13px; display: inline-block;">
          Open Admin Dashboard
        </a>
      </div>
    </div>
  </div>`;

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    name: SENDER_NAME,
    htmlBody: htmlBody
  });
}

/**
 * Sends a clean confirmation email to the attendee
 */
function sendAttendeeConfirmation(f) {
  var subject = "Thank You for Your Feedback — " + f.eventTitle;

  var htmlBody = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; color: #1f2937; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
    <div style="background-color: #0c0d12; padding: 30px 24px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 22px; margin: 0 0 6px 0; font-weight: 800;">Thank You for Your Feedback!</h1>
      <p style="color: #F59E0B; font-size: 13px; margin: 0; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase;">
        ${f.eventTitle}
      </p>
    </div>

    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; line-height: 1.6; margin-top: 0;">
        Dear <strong>${escapeHtml(f.attendeeName)}</strong>,
      </p>

      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        Thank you for attending <strong>${f.eventTitle}</strong> in <strong>${escapeHtml(f.q1)}</strong> and taking the time to complete our official feedback survey!
      </p>

      <div style="background-color: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <h4 style="margin: 0 0 10px 0; color: #111827; font-size: 13px; text-transform: uppercase;">Your Submitted Responses</h4>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Overall Experience:</strong> ${escapeHtml(f.q2)}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Would Attend Future Events:</strong> ${escapeHtml(f.q9)}</p>
        <p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Recommendation Score:</strong> ${escapeHtml(f.q10)}</p>
        ${f.q4 ? `<p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Enjoyed Most:</strong> ${escapeHtml(f.q4)}</p>` : ''}
        ${f.q7 ? `<p style="margin: 4px 0; font-size: 13px; color: #374151;"><strong>Artist Desired Next:</strong> ${escapeHtml(f.q7)}</p>` : ''}
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">
        Your valuable input directly shapes our future productions, artist line-ups, and upcoming festivals like <strong>Maha Onam 2027</strong> and <strong>Global Fest 2027</strong>.
      </p>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
        <a href="https://levitateinc.ca" style="background-color: #F59E0B; color: #0c0d12; text-decoration: none; padding: 10px 24px; border-radius: 6px; font-weight: bold; font-size: 13px; display: inline-block;">
          Visit Levitate Entertainment
        </a>
      </div>
    </div>

    <div style="background-color: #f9fafb; padding: 16px 24px; text-align: center; font-size: 12px; color: #9ca3af; border-top: 1px solid #e5e7eb;">
      &copy; 2026 Levitate Entertainment Inc. All rights reserved.
    </div>
  </div>`;

  MailApp.sendEmail({
    to: f.attendeeEmail,
    subject: subject,
    name: SENDER_NAME,
    htmlBody: htmlBody
  });
}

/**
 * Simple HTML sanitizer
 */
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Creates sheet & formats headers automatically
 */
function getOrCreateFeedbackSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  if (sheet.getLastRow() === 0) {
    var headers = [
      "Timestamp",
      "Event",
      "Q1: City Attended",
      "Q2: Overall Experience",
      "Q3: Ticketing Platform (Toronto)",
      "Q4: Enjoyed Most",
      "Q5: Areas to Improve",
      "Q6: One Thing Better",
      "Q7: Artist Desired Next",
      "Q8: 2027 Events Interest",
      "Q9: Attend Another Event",
      "Q10: Recommend Score (1-10)",
      "Q11: Heard About Live",
      "Q11: Heard (Other Details)",
      "Q12: Current Updates Channels",
      "Q13: Preferred Updates Channels",
      "Q14: 2027 Involvement Interest",
      "Attendee Name",
      "Attendee Email",
      "Attendee Phone",
      "Marketing Consent"
    ];

    sheet.appendRow(headers);

    // Style the Header Row
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground("#111827");
    headerRange.setFontColor("#FBBF24");
    headerRange.setFontWeight("bold");
    headerRange.setFontSize(11);
    headerRange.setWrap(true);
    headerRange.setVerticalAlignment("middle");
    headerRange.setHorizontalAlignment("center");
    sheet.setRowHeight(1, 45);
    sheet.setFrozenRows(1);

    for (var i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 175);
    }
    sheet.setColumnWidth(1, 160);
    sheet.setColumnWidth(7, 240);
    sheet.setColumnWidth(8, 240);
    sheet.setColumnWidth(9, 200);
    sheet.setColumnWidth(10, 220);
    sheet.setColumnWidth(15, 220);
    sheet.setColumnWidth(16, 200);
    sheet.setColumnWidth(17, 220);
  }

  return sheet;
}

/**
 * Optional Test Runner: Initializes headers immediately in active Google Sheet
 */
function setupSheet() {
  getOrCreateFeedbackSheet();
  SpreadsheetApp.getUi().alert("Sheet 'Rimi Tomy Feedback' initialized with 14 questions + contact headers!");
}
