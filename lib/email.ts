import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_FROM || smtpUser;
const adminEmail = process.env.ADMIN_EMAIL;
const adminEmails = process.env.ADMIN_EMAILS;

function ensureConfig() {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    throw new Error("SMTP is not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.");
  }
  if (!fromEmail) {
    throw new Error("FROM email not configured. Please set FROM_EMAIL or SMTP_FROM or SMTP_USER.");
  }
  if (!adminEmail && !adminEmails) {
    throw new Error("Admin recipient not configured. Please set ADMIN_EMAIL or ADMIN_EMAILS.");
  }
}

function getTransporter() {
  ensureConfig();
  const secure = smtpPort === 465; // typical TLS port
  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort!,
    secure,
    auth: {
      user: smtpUser!,
      pass: smtpPass!,
    },
  });
}

export type NewUserDetails = {
  clerkId: string;
  email?: string;
  firstName?: string | null;
  lastName?: string | null;
  imageUrl?: string | null;
};

export async function sendAdminNewUserEmail(user: NewUserDetails) {
  const transporter = getTransporter();

  const subject = `New user signed up: ${user.firstName || ""} ${user.lastName || ""}`.trim();

  const html = `
    <h2>New User Signed Up</h2>
    <ul>
      <li><strong>Clerk ID:</strong> ${user.clerkId}</li>
      <li><strong>Email:</strong> ${user.email || "(none)"}</li>
      <li><strong>Name:</strong> ${(user.firstName || "").toString()} ${(user.lastName || "").toString()}</li>
      <li><strong>Image URL:</strong> ${user.imageUrl || "(none)"}</li>
      <li><strong>Time:</strong> ${new Date().toISOString()}</li>
    </ul>
  `;

  const recipients = adminEmails
    ? adminEmails.split(",").map((s) => s.trim()).filter(Boolean)
    : [adminEmail!];

  await transporter.sendMail({
    from: fromEmail!,
    to: recipients,
    subject,
    html,
  });
}
