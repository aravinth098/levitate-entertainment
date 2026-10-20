/**
 * ============================================================================
 * LEVITATE ENTERTAINMENT — RIMI TOMY LIVE IN CANADA 2026
 * Google Apps Script for Real-Time Event Feedback Collection & Automated Emails
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

    // Readable label mappings
    var expMap = {
      "5": "5 - Excellent",
      "4": "4 - Good",
      "3": "3 - Average",
      "2": "2 - Fair",
      "1": "1 - Poor"
    };

    var agreeMap = {
      "5": "5 – Strongly agree",
      "4": "4 - Agree",
      "3": "3 - Neutral",
      "2": "2 - Disagree",
      "1": "1 – Strongly disagree"
    };

    var safeMap = {
      "5": "5 – Extremely safe",
      "4": "4 - Safe",
      "3": "3 - Neutral",
      "2": "2 - Unsafe",
      "1": "1 – Extremely unsafe"
    };

    var now = new Date();
    var formattedDate = Utilities.formatDate(now, Session.getScriptTimeZone() || "America/Toronto", "yyyy-MM-dd HH:mm:ss");

    var city = data.city || data.cityAttended || "Toronto (Whitby)";
    var q1 = expMap[String(data.overallExperience)] || data.overallExperience || "";
    var q2 = agreeMap[String(data.bookingAndAccess)] || data.bookingAndAccess || "";
    var q3 = agreeMap[String(data.performanceAndProduction)] || data.performanceAndProduction || "";
    var q4 = data.memorableMoment || "";
    var q5 = safeMap[String(data.safetyAndComfort)] || data.safetyAndComfort || "";
    var q6 = expMap[String(data.crowdManagement)] || data.crowdManagement || "";
    var q7 = data.organizationThoughts || "";
    var q8 = data.improvementSuggestions || "";
    var q9 = data.recommendScore ? String(data.recommendScore) + " / 10" : "";
    var q10 = data.ageGroup || "";
    var q11 = data.heardFrom || "";
    var q11Other = data.heardFromOther || "";
    var q12 = data.additionalComments || "";

    var attendeeName = data.attendeeName ? data.attendeeName.trim() : "Anonymous";
    var attendeeEmail = data.attendeeEmail ? data.attendeeEmail.trim() : "";
    var attendeePhone = data.attendeePhone ? data.attendeePhone.trim() : "";
    var eventTitle = data.eventTitle || "RIMI TOMY LIVE — Canada 2026";

    // 12 Questions + Metadata Row
    var row = [
      formattedDate,
      eventTitle,
      city,
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
      attendeeName,
      attendeeEmail,
      attendeePhone
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
      city: city,
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
      attendeeName: attendeeName,
      attendeeEmail: attendeeEmail,
      attendeePhone: attendeePhone,
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
 * Send Alert Email to Admin (websitelevitate.inc@gmail.com)
 */
function sendAdminNotification(f) {
  var subject = "🔔 New Feedback Received: " + f.eventTitle + " — " + f.city + " (" + (f.q1 || "Rated") + ")";

  var htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0d0f17; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #2d3748;">
    <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 24px; border-bottom: 2px solid #F59E0B; text-align: center;">
      <h2 style="margin: 0; color: #FBBF24; font-size: 22px; letter-spacing: 0.5px;">New Attendee Feedback Received</h2>
      <p style="margin: 6px 0 0 0; color: #9ca3af; font-size: 13px;">${f.eventTitle} • ${f.city}</p>
    </div>

    <div style="padding: 24px;">
      <!-- Attendee Information -->
      <div style="background-color: #1a202c; border-radius: 8px; padding: 16px; margin-bottom: 20px; border-left: 4px solid #FBBF24;">
        <h4 style="margin: 0 0 10px 0; color: #FBBF24; font-size: 14px; text-transform: uppercase;">Attendee Information</h4>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Name:</strong> ${escapeHtml(f.attendeeName)}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Email:</strong> ${f.attendeeEmail ? escapeHtml(f.attendeeEmail) : '<span style="color: #a0aec0;">Not provided</span>'}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Phone:</strong> ${f.attendeePhone ? escapeHtml(f.attendeePhone) : '<span style="color: #a0aec0;">Not provided</span>'}</p>
        <p style="margin: 4px 0; color: #e2e8f0; font-size: 13px;"><strong>Submitted:</strong> ${f.timestamp}</p>
      </div>

      <!-- Quick Ratings Overview -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;">
        <tr style="background-color: #1a202c;">
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af; width: 40%;"><strong>Q1: Overall Experience</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #FBBF24; font-weight: bold;">${escapeHtml(f.q1)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q2: Booking & Access</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q2)}</td>
        </tr>
        <tr style="background-color: #1a202c;">
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q3: Performance & Stage</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q3)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q5: Safety & Security</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q5)}</td>
        </tr>
        <tr style="background-color: #1a202c;">
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q6: Crowd Management</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q6)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q9: Recommendation (NPS)</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #38bdf8; font-weight: bold;">${escapeHtml(f.q9)}</td>
        </tr>
        <tr style="background-color: #1a202c;">
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q10: Age Group</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q10)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #9ca3af;"><strong>Q11: Heard From</strong></td>
          <td style="padding: 10px; border: 1px solid #2d3748; color: #e2e8f0;">${escapeHtml(f.q11)} ${f.q11Other ? '(' + escapeHtml(f.q11Other) + ')' : ''}</td>
        </tr>
      </table>

      <!-- Long-form feedback answers -->
      ${f.q4 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #1a202c; border-radius: 6px;">
        <div style="color: #FBBF24; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q4: Most Memorable Performance / Moment:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q4)}"</div>
      </div>` : ''}

      ${f.q7 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #1a202c; border-radius: 6px;">
        <div style="color: #FBBF24; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q7: Organization Feedback:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q7)}"</div>
      </div>` : ''}

      ${f.q8 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #1a202c; border-radius: 6px;">
        <div style="color: #FBBF24; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q8: Suggestions to Improve:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q8)}"</div>
      </div>` : ''}

      ${f.q12 ? `
      <div style="margin-bottom: 15px; padding: 12px; background-color: #1a202c; border-radius: 6px;">
        <div style="color: #FBBF24; font-size: 12px; font-weight: bold; margin-bottom: 4px;">Q12: Additional Comments:</div>
        <div style="color: #e2e8f0; font-size: 13px; line-height: 1.5;">"${escapeHtml(f.q12)}"</div>
      </div>` : ''}

      <div style="text-align: center; margin-top: 25px;">
        <a href="https://levitateinc.ca/admin" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #000000; text-decoration: none; padding: 10px 24px; border-radius: 20px; font-weight: bold; font-size: 13px; display: inline-block;">
          Open Admin Dashboard
        </a>
      </div>
    </div>
  </div>`;

  MailApp.sendEmail({
    to: ADMIN_EMAIL,
    subject: subject,
    name: SENDER_NAME + " Notifications",
    htmlBody: htmlBody
  });
}

/**
 * Send Confirmation Email to the Attendee
 */
function sendAttendeeConfirmation(f) {
  var subject = "Thank you for your feedback! — " + f.eventTitle;
  var greeting = (f.attendeeName && f.attendeeName !== "Anonymous") ? "Dear " + escapeHtml(f.attendeeName) : "Hello";

  var htmlBody = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0d0f17; color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #2d3748;">
    <div style="background: linear-gradient(135deg, #111827 0%, #1f2937 100%); padding: 30px 20px; border-bottom: 2px solid #F59E0B; text-align: center;">
      <h1 style="margin: 0; color: #FBBF24; font-size: 24px; font-weight: bold;">Thank You for Your Feedback!</h1>
      <p style="margin: 8px 0 0 0; color: #9ca3af; font-size: 14px;">${f.eventTitle}</p>
    </div>

    <div style="padding: 28px 24px;">
      <p style="font-size: 15px; color: #f3f4f6; margin-top: 0;">${greeting},</p>
      
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Thank you so much for taking the time to share your thoughts about your experience at <strong>${f.eventTitle} (${f.city})</strong>.
      </p>

      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Your candid input helps our team continuously elevate the stage design, acoustics, artist selection, and attendee logistics for all future Levitate Entertainment productions across Canada.
      </p>

      <!-- Feedback Summary Card -->
      <div style="background-color: #1a202c; border-radius: 8px; padding: 18px; margin: 24px 0; border: 1px solid #2d3748;">
        <h4 style="margin: 0 0 12px 0; color: #FBBF24; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Your Response Summary</h4>
        <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 6px;"><strong>City Attended:</strong> ${f.city}</div>
        <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 6px;"><strong>Overall Experience:</strong> ${escapeHtml(f.q1)}</div>
        <div style="font-size: 13px; color: #e2e8f0; margin-bottom: 6px;"><strong>Likelihood to Recommend:</strong> ${escapeHtml(f.q9)}</div>
        ${f.q4 ? `<div style="font-size: 13px; color: #e2e8f0; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #2d3748;"><strong>Favorite Moment:</strong> <em>"${escapeHtml(f.q4)}"</em></div>` : ''}
      </div>

      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        Stay tuned for our upcoming arena concerts, dance competitions, and cultural festivals!
      </p>

      <div style="text-align: center; margin: 28px 0 15px 0;">
        <a href="https://levitateinc.ca/our-events" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: #000000; text-decoration: none; padding: 12px 28px; border-radius: 25px; font-weight: bold; font-size: 14px; display: inline-block;">
          Explore Upcoming Events
        </a>
      </div>

      <div style="border-top: 1px solid #2d3748; margin-top: 25px; padding-top: 18px; font-size: 12px; color: #94a3b8; text-align: center;">
        <p style="margin: 0 0 4px 0;">Warm regards,</p>
        <p style="margin: 0; font-weight: bold; color: #FBBF24;">Levitate Entertainment Team</p>
        <p style="margin: 4px 0 0 0;"><a href="https://levitateinc.ca" style="color: #94a3b8; text-decoration: underline;">levitateinc.ca</a></p>
      </div>
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
 * Simple HTML sanitizer to prevent tag breaking in email
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
      "City Attended",
      "Q1: Overall Experience",
      "Q2: Booking & Access",
      "Q3: Performance & Production",
      "Q4: Memorable Moment / Song",
      "Q5: Safety & Security",
      "Q6: Crowd Management",
      "Q7: Organization Feedback",
      "Q8: Suggestions to Improve",
      "Q9: Recommend Score (1-10)",
      "Q10: Age Group",
      "Q11: Heard From",
      "Q11: Referral (Other Details)",
      "Q12: Additional Comments",
      "Attendee Name",
      "Attendee Email",
      "Attendee Phone"
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
    sheet.setColumnWidth(7, 260);
    sheet.setColumnWidth(10, 260);
    sheet.setColumnWidth(11, 260);
    sheet.setColumnWidth(16, 260);
  }

  return sheet;
}

/**
 * Optional Test Runner: Generates headers immediately
 */
function setupSheet() {
  getOrCreateFeedbackSheet();
  SpreadsheetApp.getUi().alert("Sheet 'Rimi Tomy Feedback' initialized with formatted headers!");
}
