import { GoogleAuthProvider, signInWithPopup, User } from 'firebase/auth';
import { auth } from './firebase';

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/gmail.send');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');

let cachedAccessToken: string | null = null;
let cachedGmailUser: User | null = null;

export async function signInWithGmail(): Promise<{ user: User; accessToken: string }> {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Access token was not granted by Google Auth.');
    }
    cachedAccessToken = credential.accessToken;
    cachedGmailUser = result.user;
    sessionStorage.setItem('google_access_token', credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (err: any) {
    console.error('Gmail Authorization error:', err);
    throw err;
  }
}

export function getCachedGmailToken(): string | null {
  if (!cachedAccessToken) {
    cachedAccessToken = sessionStorage.getItem('google_access_token');
  }
  return cachedAccessToken;
}

export function getCachedGmailUser(): User | null {
  return cachedGmailUser;
}

export function disconnectGmail() {
  cachedAccessToken = null;
  cachedGmailUser = null;
}

function chunkBase64(str: string): string {
  const chunks = [];
  for (let i = 0; i < str.length; i += 76) {
    chunks.push(str.substring(i, i + 76));
  }
  return chunks.join('\r\n');
}

function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryString = '';
  const chunkSize = 8192;
  for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
    const chunk = utf8Bytes.subarray(i, i + chunkSize);
    // Use regular loop if spread operator crashes for some reason, though 8192 is well under limit
    binaryString += String.fromCharCode(...chunk);
  }
  return btoa(binaryString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailSupportTicket({
  username,
  userEmail,
  issue,
  accessToken,
  type = 'general',
  attachments = []
}: {
  username: string;
  userEmail: string;
  issue: string;
  accessToken: string;
  type?: 'bug' | 'feedback' | 'security' | 'general';
  attachments?: { name: string; type: string; size: number; dataUrl: string }[];
}) {
  const supportEmail = 'docscraftpro@gmail.com';
  
  // Customizing internal team subjects and templates to keep categorization distinct
  let teamSubject = `Docscraft Support Ticket - From ${username}`;
  let teamGreeting = `Hello Support Team,\r\n\r\nA new support ticket has been filed by a user.`;
  
  if (type === 'bug') {
    teamSubject = `[BUG REPORT] Docscraft Pro - Parser / Render Issue from ${username}`;
    teamGreeting = `Hello Engineering Squad,\r\n\r\nA technical bug or parser anomaly report was raised. Details below:`;
  } else if (type === 'feedback') {
    teamSubject = `[WORKSPACE FEEDBACK] Creative Idea / Suggestions from ${username}`;
    teamGreeting = `Hello Design & Feature Squad,\r\n\r\nA user shared fresh workspace ideas and suggestions. Details below:`;
  } else if (type === 'security') {
    teamSubject = `[SECURITY DESK] Enterprise Compliance Inquiry from ${username}`;
    teamGreeting = `Hello Operations & Arch Desk,\r\n\r\nAn enterprise compliance or secure data governance query has been received. Details below:`;
  }

  const boundary = `----=_Part_${Math.random().toString(36).substring(2)}`;
  
  let supportEmailParts = [
    `To: ${supportEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(teamSubject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    '',
    teamGreeting,
    `------------------------------------------------------------`,
    `Sender Name: ${username}`,
    `Sender Email: ${userEmail}`,
    `------------------------------------------------------------`,
    `Inquiry Details:`,
    issue,
    '',
    `------------------------------------------------------------`,
    `Processed internally via Docscraft Workplace Desk.`,
    ''
  ];

  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      const base64Data = file.dataUrl.split(',')[1];
      supportEmailParts.push(
        `--${boundary}`,
        `Content-Type: ${file.type}; name="${file.name}"`,
        `Content-Disposition: attachment; filename="${file.name}"`,
        `Content-Transfer-Encoding: base64`,
        '',
        chunkBase64(base64Data),
        ''
      );
    });
  }

  supportEmailParts.push(`--${boundary}--`);
  const supportEmailContent = supportEmailParts.join('\r\n');

  const rawSupport = base64UrlEncode(supportEmailContent);

  const supportPromise = fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawSupport })
  }).then(async res => {
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to send support ticket email: ${errText}`);
    }
    return res.json();
  });

  // Unique confirmation receipt templates for the user's Inbox
  let confirmationSubject = `[Docscraft Pro] Support Inquiry Received`;
  let confirmationHeader = `Docscraft Pro Support`;
  let confirmationMessage = `<p>Thank you for reaching out. We have successfully received your support query and our team will check and look into it.</p><p>We will follow up directly at this email address within 24 to 48 hours to assist you.</p>`;

  if (type === 'bug') {
    confirmationSubject = `[Docscraft Pro] Technical Bug Report Received`;
    confirmationHeader = `Docscraft Pro Support`;
    confirmationMessage = `<p>Thank you for letting us know about this issue. We have successfully received your bug report and our team will check it.</p><p>We will investigate the issue and follow up directly at this email address within 24 to 48 hours.</p>`;
  } else if (type === 'feedback') {
    confirmationSubject = `[Docscraft Pro] Feedback Received`;
    confirmationHeader = `Docscraft Pro Support`;
    confirmationMessage = `<p>Thank you for sharing your thoughts with us. We have received your feedback and our team will check it as we continue to improve Docscraft Pro.</p><p>We appreciate you taking the time to write to us.</p>`;
  } else if (type === 'security') {
    confirmationSubject = `[Docscraft Pro] Security Inquiry Received`;
    confirmationHeader = `Docscraft Pro Support`;
    confirmationMessage = `<p>We have successfully received your security query. Our team will check and review your inquiry immediately.</p><p>We will follow up directly at this email address within 24 to 48 hours.</p>`;
  } else if (type === 'general') {
    confirmationSubject = `[Docscraft Pro] Support Inquiry Received`;
    confirmationHeader = `Docscraft Pro Support`;
    confirmationMessage = `<p>Thank you for reaching out. We have successfully received your support query and our team will check and look into it.</p><p>We will follow up directly at this email address within 24 to 48 hours to assist you.</p>`;
  }

  const confirmationEmailContent = [
    `To: ${userEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(confirmationSubject)))}?=`,
    `Content-Type: text/html; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    '',
    `<!DOCTYPE html>`,
    `<html>`,
    `<head>`,
    `  <meta charset="utf-8">`,
    `  <style>`,
    `    body { font-family: 'Inter', system-ui, sans-serif; color: #2d2d2d; line-height: 1.6; background-color: #fdfbf7; margin: 0; padding: 24px; }`,
    `    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #eae6df; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }`,
    `    .header { font-size: 20px; font-weight: bold; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 24px; }`,
    `    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }`,
    `    .section { margin-bottom: 20px; }`,
    `    .ticket-details { background: #faf9f6; border-left: 4px solid #D4AF37; padding: 16px; border-radius: 6px; font-size: 14px; margin-top: 12px; white-space: pre-wrap; }`,
    `    .footer { font-size: 12px; color: #7f8c8d; border-top: 1px solid #eae6df; padding-top: 16px; margin-top: 32px; }`,
    `  </style>`,
    `</head>`,
    `<body>`,
    `  <div class="container">`,
    `    <div class="header">${confirmationHeader}</div>`,
    `    <div class="greeting">Hello ${username},</div>`,
    `    <div class="section">`,
    `      ${confirmationMessage}`,
    `    </div>`,
    `    <div class="section">`,
    `      <strong>Your Submitted Details:</strong>`,
    `      <div class="ticket-details">${issue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>`,
    `    </div>`,
    `    <div class="footer">`,
    `      <p>This is an automated confirmation sent securely from Docscraft Workspace. Do not reply directly to this mail.</p>`,
    `      <p>© ${new Date().getFullYear()} Docscraft Pro. All rights reserved.</p>`,
    `    </div>`,
    `  </div>`,
    `</body>`,
    `</html>`
  ].join('\r\n');

  const rawConfirmation = base64UrlEncode(confirmationEmailContent);

  const confirmationPromise = fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawConfirmation })
  }).then(async res => {
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Failed to send confirmation receipt: ${errText}`);
    }
    return res.json();
  });

  return Promise.all([supportPromise, confirmationPromise]);
}

export async function sendWelcomeEmail({
  userEmail,
  username,
  accessToken
}: {
  userEmail: string;
  username: string;
  accessToken: string;
}) {
  const confirmationSubject = `[Docscraft Pro] Welcome to Docscraft Pro!`;
  const confirmationHeader = `Welcome to Docscraft Pro`;
  const confirmationMessage = `<p>We are thrilled to welcome you to Docscraft Pro! Your account has been successfully created and you can now start establishing a professional paradigm for document engineering.</p><p>We have received your registration details. Should you have any questions or require support, please feel free to reach out to our team.</p>`;

  const confirmationEmailContent = [
    `To: ${userEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(confirmationSubject)))}?=`,
    `Content-Type: text/html; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    '',
    `<!DOCTYPE html>`,
    `<html>`,
    `<head>`,
    `  <meta charset="utf-8">`,
    `  <style>`,
    `    body { font-family: 'Inter', system-ui, sans-serif; color: #2d2d2d; line-height: 1.6; background-color: #fdfbf7; margin: 0; padding: 24px; }`,
    `    .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px; border: 1px solid #eae6df; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }`,
    `    .header { font-size: 20px; font-weight: bold; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 24px; }`,
    `    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }`,
    `    .section { margin-bottom: 20px; }`,
    `    .footer { font-size: 12px; color: #7f8c8d; border-top: 1px solid #eae6df; padding-top: 16px; margin-top: 32px; }`,
    `  </style>`,
    `</head>`,
    `<body>`,
    `  <div class="container">`,
    `    <div class="header">${confirmationHeader}</div>`,
    `    <div class="greeting">Hello ${username || 'Crafter'},</div>`,
    `    <div class="section">`,
    `      ${confirmationMessage}`,
    `    </div>`,
    `    <div class="footer">`,
    `      <p>This is an automated confirmation sent securely from Docscraft Workspace. Do not reply directly to this mail.</p>`,
    `      <p>© ${new Date().getFullYear()} Docscraft Pro. All rights reserved.</p>`,
    `    </div>`,
    `  </div>`,
    `</body>`,
    `</html>`
  ].join('\r\n');

  const rawConfirmation = base64UrlEncode(confirmationEmailContent);

  return fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawConfirmation })
  }).then(async res => {
    if (!res.ok) {
      const errText = await res.text();
      console.error(`Failed to send welcome receipt: ${errText}`);
    }
  });
}
