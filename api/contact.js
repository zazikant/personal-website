/**
 * Contact form API — sends email via SMTP using nodemailer.
 *
 * Environment variables (set in Vercel → Project → Settings → Environment Variables):
 *   SMTP_PASS  (required) — password for news@gemengserv.net
 *
 * Defaults (non-secret, hardcoded for convenience):
 *   SMTP_HOST  = mail.gemengserv.net
 *   SMTP_PORT  = 587
 *   SMTP_USER  = news@gemengserv.net
 *   MAIL_TO    = shashikant.zarekar@gemengserv.com
 *
 * Override any default by setting the corresponding env var.
 */

const nodemailer = require('nodemailer');

// Non-secret defaults — safe to commit. Only SMTP_PASS must come from env.
const SMTP_HOST = process.env.SMTP_HOST || 'mail.gemengserv.net';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'news@gemengserv.net';
const SMTP_PASS = process.env.SMTP_PASS; // REQUIRED — must be set in Vercel env
const MAIL_TO   = process.env.MAIL_TO   || 'shashikant.zarekar@gemengserv.com';

// Basic email validation
function isValidEmail(str) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(str || ''));
}

// Rate limiting (in-memory, per serverless instance — best-effort)
const requestTimestamps = [];
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per minute per instance

function isRateLimited() {
  const now = Date.now();
  // Prune old entries
  while (requestTimestamps.length && requestTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
    requestTimestamps.shift();
  }
  if (requestTimestamps.length >= RATE_LIMIT_MAX) {
    return true;
  }
  requestTimestamps.push(now);
  return false;
}

module.exports = async (req, res) => {
  // CORS — same-origin by default, but allow all origins for flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed. Use POST.' });
  }

  // Rate limit check
  if (isRateLimited()) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please wait a moment and try again.' });
  }

  // Parse body
  let body;
  try {
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body);
    } else {
      body = req.body;
    }
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'Invalid JSON body.' });
  }

  const name    = (body.name    || '').toString().trim().slice(0, 200);
  const email   = (body.email   || '').toString().trim().slice(0, 200);
  const company = (body.company || '').toString().trim().slice(0, 200);
  const plan    = (body.plan    || '').toString().trim().slice(0, 100);
  const message = (body.message || '').toString().trim().slice(0, 5000);

  // Validate required fields
  if (!name) {
    return res.status(400).json({ ok: false, error: 'Name is required.' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ ok: false, error: 'A valid email address is required.' });
  }
  if (!message) {
    return res.status(400).json({ ok: false, error: 'Message is required.' });
  }

  // Check SMTP password is configured
  if (!SMTP_PASS) {
    console.error('[contact] SMTP_PASS environment variable is not set.');
    return res.status(500).json({
      ok: false,
      error: 'Email service is not configured. The site administrator needs to set the SMTP_PASS environment variable.'
    });
  }

  // Build email content
  const planLabels = {
    monthly: 'Monthly — $50/month',
    onetime: 'One-time purchase — $1,000',
    notsure: 'Not sure yet — help me decide'
  };
  const planLabel = planLabels[plan] || plan || '—';

  const textBody = [
    'New contact form submission — DoqueRAG',
    '===========================================',
    '',
    `Name:    ${name}`,
    `Email:   ${email}`,
    `Company: ${company || '—'}`,
    `Plan:    ${planLabel}`,
    '',
    'Message:',
    '-------------------------------------------',
    message,
    '-------------------------------------------',
    '',
    `Submitted: ${new Date().toISOString()}`,
  ].join('\n');

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a;">
      <h2 style="margin: 0 0 20px; color: #0B0D10;">New contact form submission — DoqueRAG</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <tr><td style="padding: 8px 0; font-weight: 600; color: #555; width: 100px; vertical-align: top;">Name:</td><td style="padding: 8px 0;">${escapeHtml(name)}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #555; vertical-align: top;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}" style="color: #2C655E;">${escapeHtml(email)}</a></td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #555; vertical-align: top;">Company:</td><td style="padding: 8px 0;">${escapeHtml(company || '—')}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: 600; color: #555; vertical-align: top;">Plan:</td><td style="padding: 8px 0;">${escapeHtml(planLabel)}</td></tr>
      </table>
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #555; text-transform: uppercase; letter-spacing: 0.08em;">Message</h3>
      <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; white-space: pre-wrap; font-size: 15px; line-height: 1.6;">${escapeHtml(message)}</div>
      <p style="margin: 24px 0 0; font-size: 12px; color: #999;">Submitted: ${new Date().toISOString()}</p>
    </div>
  `;

  // Create transporter
  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465, // true for port 465, false for 587
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });

    // Send mail
    const info = await transporter.sendMail({
      from: `"DoqueRAG Website" <${SMTP_USER}>`,
      to: MAIL_TO,
      replyTo: `"${name}" <${email}>`,
      subject: `DoqueRAG enquiry from ${name}`,
      text: textBody,
      html: htmlBody,
    });

    console.log('[contact] Email sent:', info.messageId);
    return res.status(200).json({ ok: true, messageId: info.messageId });
  } catch (err) {
    console.error('[contact] SMTP error:', err);
    return res.status(500).json({
      ok: false,
      error: 'Failed to send email. Please try again later or email us directly.',
    });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
