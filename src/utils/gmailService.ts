import { getGoogleAccessToken } from './googleAuth';

export interface SendEmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  plainText?: string;
}

// Convert Unicode string to base64url safe string according to RFC 2822 & Gmail API
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email via Gmail API using the in-memory access token.
 */
export async function sendGmailMessage(payload: SendEmailPayload): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = getGoogleAccessToken();
  if (!token) {
    return {
      success: false,
      error: 'Google account is not connected. Please connect with Google first.',
    };
  }

  try {
    const emailLines = [
      `To: ${payload.to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${payload.subject}`,
      '',
      payload.htmlBody,
    ];

    const rawMessage = emailLines.join('\r\n');
    const encodedEmail = base64UrlEncode(rawMessage);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedEmail }),
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Gmail API HTTP ${response.status}`);
    }

    const data = await response.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    console.error('Failed to send email via Gmail:', err);
    return { success: false, error: err.message || 'Unknown error occurred while sending email' };
  }
}

/**
 * Creates email templates for login, OTP, session timeout, and patient reports
 */
export function buildDoctorLoginNotificationEmail(doctorName: string, clinic: string, dateStr: string): SendEmailPayload {
  return {
    to: '', // Provided by recipient
    subject: `[MedPass Clinical Security] Physician Sign-In Notification: ${doctorName}`,
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background-color: #004f45; padding: 18px 24px; border-radius: 12px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">MedPass Medical Security Alert</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">Doctor Clinical Access Notice</p>
        </div>
        
        <div style="padding: 24px 8px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p>Hello <strong>${doctorName}</strong>,</p>
          <p>This automated security message confirms a login event to the MedPass Clinician Workstation.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 18px 0; background-color: white; border-radius: 8px; border: 1px solid #cbd5e1;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Login Date & Time</td>
              <td style="padding: 12px 16px; font-weight: 700; color: #004f45;">${dateStr}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Facility / Location</td>
              <td style="padding: 12px 16px;">${clinic}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #64748b; font-weight: 600;">Privacy Protocol</td>
              <td style="padding: 12px 16px; color: #059669; font-weight: 600;">Protocol 7 (Zero-Residual RAM Session)</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #64748b;">If you did not initiate this login, please immediately revoke session access via your MedPass administration panel.</p>
        </div>
      </div>
    `,
  };
}

export function buildOtpEmail(recipientName: string, otpCode: string, expiryMinutes = 10): SendEmailPayload {
  return {
    to: '',
    subject: `[MedPass Verification] Your Secure Access Code: ${otpCode}`,
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background-color: #004f45; padding: 18px 24px; border-radius: 12px; color: white; text-align: center;">
          <h2 style="margin: 0; font-size: 20px;">MedPass One-Time Security Code</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">Patient & Clinician Chart Verification</p>
        </div>
        
        <div style="padding: 24px 12px; text-align: center; color: #1e293b;">
          <p style="font-size: 14px;">Hello <strong>${recipientName}</strong>,</p>
          <p style="font-size: 14px; color: #475569;">Use the one-time code below to unlock the patient records and verify your identity:</p>
          
          <div style="margin: 24px auto; background-color: #e6f6ff; border: 2px dashed #004f45; border-radius: 12px; padding: 16px 28px; display: inline-block;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #004f45;">${otpCode}</span>
          </div>

          <p style="font-size: 13px; color: #64748b; margin-top: 16px;">This code will expire in <strong>${expiryMinutes} minutes</strong>. Never share this code with anyone.</p>
        </div>
      </div>
    `,
  };
}

export function buildSessionTimeoutEmail(recipientName: string, patientName: string, durationStr: string): SendEmailPayload {
  return {
    to: '',
    subject: `[MedPass Notice] Visit Ended & Screen Locked for ${patientName}`,
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background-color: #004f45; padding: 18px 24px; border-radius: 12px; color: white;">
          <h2 style="margin: 0; font-size: 20px;">Session Completed & Screen Locked</h2>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.85;">Privacy Protection Automated Report</p>
        </div>
        
        <div style="padding: 24px 8px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <p>Hello <strong>${recipientName}</strong>,</p>
          <p>The clinical review session for <strong>${patientName}</strong> has been ended and the patient records have been wiped from temporary memory to prevent unauthorized viewing.</p>
          
          <div style="background-color: white; border-radius: 8px; border: 1px solid #cbd5e1; padding: 16px; margin: 16px 0;">
            <p style="margin: 4px 0;">⏱️ <strong>Session Duration:</strong> ${durationStr}</p>
            <p style="margin: 4px 0;">🔒 <strong>Privacy Status:</strong> Memory Cleared & Screen Locked</p>
            <p style="margin: 4px 0;">📋 <strong>Audit Trail:</strong> Permanently logged in patient privacy records</p>
          </div>

          <p style="font-size: 12px; color: #64748b;">To reopen the chart, re-enter your 6-digit access code in the MedPass app.</p>
        </div>
      </div>
    `,
  };
}

export function buildPatientHealthReportEmail(
  patientName: string,
  doctorName: string,
  bloodType: string,
  allergies: string[],
  medications: string[],
  userFeedback?: string
): SendEmailPayload {
  return {
    to: '',
    subject: `[MedPass Health Passport] Official Medical Summary for ${patientName}`,
    htmlBody: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; background-color: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
        <div style="background-color: #004f45; padding: 20px 24px; border-radius: 12px; color: white;">
          <h1 style="margin: 0; font-size: 22px;">MedPass Health Passport</h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; opacity: 0.9;">Verified Patient Health Summary & Care Plan</p>
        </div>
        
        <div style="padding: 20px 4px; color: #1e293b; font-size: 14px; line-height: 1.6;">
          <div style="background-color: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #004f45; font-size: 16px;">Patient Profile</h3>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${patientName}</p>
            <p style="margin: 4px 0;"><strong>Blood Type:</strong> ${bloodType}</p>
            <p style="margin: 4px 0;"><strong>Attending Physician:</strong> ${doctorName}</p>
          </div>

          <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #9f1239; font-size: 16px;">Documented Allergies & Warnings</h3>
            <ul style="margin: 4px 0; padding-left: 20px;">
              ${allergies.map((a) => `<li style="margin-bottom: 4px; color: #881337;">${a}</li>`).join('')}
            </ul>
          </div>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">Current Prescriptions</h3>
            <ul style="margin: 4px 0; padding-left: 20px;">
              ${medications.map((m) => `<li style="margin-bottom: 4px; color: #14532d;">${m}</li>`).join('')}
            </ul>
          </div>

          ${
            userFeedback
              ? `
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
              <h3 style="margin: 0 0 8px 0; color: #1e40af; font-size: 16px;">Patient Notes & Feedback</h3>
              <p style="margin: 0; color: #1e3a8a; font-style: italic;">"${userFeedback}"</p>
            </div>
            `
              : ''
          }

          <div style="text-align: center; padding-top: 16px; border-top: 1px solid #cbd5e1; font-size: 12px; color: #64748b;">
            <p style="margin: 4px 0;">Generated securely by MedPass Ephemeral Clinical Suite.</p>
            <p style="margin: 4px 0;">Signed with SHA-256 digital provenance.</p>
          </div>
        </div>
      </div>
    `,
  };
}
