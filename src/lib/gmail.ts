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
  accessToken
}: {
  username: string;
  userEmail: string;
  issue: string;
  accessToken: string;
}) {
  const supportEmail = 'docscraftpro@gmail.com';
  
  const supportEmailContent = [
    `To: ${supportEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(`DocCraft Support Ticket - From ${username}`)))}?=`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `MIME-Version: 1.0`,
    '',
    `Hello Support Team,`,
    '',
    `A new support ticket has been filed by a user. Details below:`,
    `------------------------------------------------------------`,
    `Username: ${username}`,
    `User Contact Email: ${userEmail}`,
    `------------------------------------------------------------`,
    `Issue Description:`,
    issue,
    '',
    `------------------------------------------------------------`,
    `Sent securely via DocCraft Workspace Gmail Integration.`
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

  const confirmationEmailContent = [
    `To: ${userEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(`[DocCraft Pro] Support Inquiry Received`)))}?=`,
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
    `    .header { font-size: 24px; font-weight: bold; color: #1a1a1a; border-bottom: 2px solid #D4AF37; padding-bottom: 12px; margin-bottom: 24px; }`,
    `    .greeting { font-size: 16px; font-weight: 600; margin-bottom: 12px; }`,
    `    .section { margin-bottom: 20px; }`,
    `    .ticket-details { background: #faf9f6; border-left: 4px solid #D4AF37; padding: 16px; border-radius: 6px; font-size: 14px; margin-top: 12px; white-space: pre-wrap; }`,
    `    .footer { font-size: 12px; color: #7f8c8d; border-top: 1px solid #eae6df; padding-top: 16px; margin-top: 32px; }`,
    `  </style>`,
    `</head>`,
    `<body>`,
    `  <div class="container">`,
    `    <div class="header">DocCraft Pro Support</div>`,
    `    <div class="greeting">Hello ${username},</div>`,
    `    <div class="section">`,
    `      <p>Thank you for reaching out to DocCraft Pro Support Desk. We have successfully logged your technical inquiry and our human engineering team is reviewing it immediately.</p>`,
    `      <p>No further action is required from you at this moment. You will get a follow-up directly at this address within 24 to 48 business hours.</p>`,
    `    </div>`,
    `    <div class="section">`,
    `      <strong>Your Submitted Inquiry Details:</strong>`,
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
