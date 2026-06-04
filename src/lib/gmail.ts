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

function base64UrlEncode(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendGmailSupportTicket({
  username,
  userEmail,
  issue,
  accessToken,
  type = 'general'
}: {
  username: string;
  userEmail: string;
  issue: string;
  accessToken: string;
  type?: 'bug' | 'feedback' | 'security' | 'general';
}) {
  const supportEmail = 'docscraftpro@gmail.com';
  
  // Customizing internal team subjects and templates to keep categorization distinct
  let teamSubject = `DocCraft Support Ticket - From ${username}`;
  let teamGreeting = `Hello Support Team,\r\n\r\nA new support ticket has been filed by a user.`;
  
  if (type === 'bug') {
    teamSubject = `[BUG REPORT] DocCraft Pro - Parser / Render Issue from ${username}`;
    teamGreeting = `Hello Engineering Squad,\r\n\r\nA technical bug or parser anomaly report was raised. Details below:`;
  } else if (type === 'feedback') {
    teamSubject = `[WORKSPACE FEEDBACK] Creative Idea / Suggestions from ${username}`;
    teamGreeting = `Hello Design & Feature Squad,\r\n\r\nA user shared fresh workspace ideas and suggestions. Details below:`;
  } else if (type === 'security') {
    teamSubject = `[SECURITY DESK] Enterprise Compliance Inquiry from ${username}`;
    teamGreeting = `Hello Operations & Arch Desk,\r\n\r\nAn enterprise compliance or secure data governance query has been received. Details below:`;
  }

  const supportEmailContent = [
    `To: ${supportEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(teamSubject)))}?=`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
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
    `Processed internally via DocCraft Workplace Desk.`
  ].join('\r\n');

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
  let confirmationSubject = `[DocCraft Pro] Support Inquiry Received`;
  let confirmationHeader = `DocCraft Pro Support`;
  let confirmationMessage = `<p>Thank you for reaching out. We have successfully received your support query and our team will check and look into it.</p><p>We will follow up directly at this email address within 24 to 48 hours to assist you.</p>`;

  if (type === 'bug') {
    confirmationSubject = `[DocCraft Pro] Technical Bug Report Received`;
    confirmationHeader = `DocCraft Pro Support`;
    confirmationMessage = `<p>Thank you for letting us know about this issue. We have successfully received your bug report and our team will check it.</p><p>We will investigate the issue and follow up directly at this email address within 24 to 48 hours.</p>`;
  } else if (type === 'feedback') {
    confirmationSubject = `[DocCraft Pro] Feedback Received`;
    confirmationHeader = `DocCraft Pro Support`;
    confirmationMessage = `<p>Thank you for sharing your thoughts with us. We have received your feedback and our team will check it as we continue to improve DocCraft Pro.</p><p>We appreciate you taking the time to write to us.</p>`;
  } else if (type === 'security') {
    confirmationSubject = `[DocCraft Pro] Security Inquiry Received`;
    confirmationHeader = `DocCraft Pro Support`;
    confirmationMessage = `<p>We have successfully received your security query. Our team will check and review your inquiry immediately.</p><p>We will follow up directly at this email address within 24 to 48 hours.</p>`;
  } else if (type === 'general') {
    confirmationSubject = `[DocCraft Pro] Support Inquiry Received`;
    confirmationHeader = `DocCraft Pro Support`;
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
    `      <p>This is an automated confirmation sent securely from DocCraft Workspace. Do not reply directly to this mail.</p>`,
    `      <p>© ${new Date().getFullYear()} DocCraft Pro. All rights reserved.</p>`,
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
