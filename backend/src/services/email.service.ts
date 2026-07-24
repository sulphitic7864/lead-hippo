import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter: nodemailer.Transporter | undefined;
function getTransporter() {
  if (transporter) return transporter;
  if (
    !env.SMTP_HOST ||
    !env.SMTP_USER ||
    !env.SMTP_PASSWORD ||
    env.SMTP_PASSWORD === "replace_me"
  ) {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  } else {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASSWORD },
    });
  }
  return transporter;
}

const shell = (title: string, body: string) =>
  `<!doctype html><html><body style="margin:0;background:#f4f6f8;font-family:Arial,sans-serif;color:#132032"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px"><table role="presentation" width="620" style="max-width:100%;background:white;border-radius:18px;overflow:hidden"><tr><td style="background:#0D1B2A;padding:24px;color:white;font-size:22px;font-weight:700">Lead <span style="color:#60a5fa">Hippo</span></td></tr><tr><td style="padding:30px"><h1 style="font-size:24px;margin:0 0 18px">${title}</h1>${body}<p style="margin-top:28px;color:#64748b;font-size:13px">Lead Hippo · More Leads. More Jobs. More Growth.</p></td></tr></table></td></tr></table></body></html>`;

export async function sendBuyerReport(input: {
  to: string;
  title: string;
  city: string;
  leadCode: string;
  reportPath: string;
}) {
  return getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: input.to,
    subject: `Your Lead Hippo Opportunity Report — ${input.title}, ${input.city}`,
    html: shell(
      "Your Opportunity Report is ready",
      `<p>Thank you for purchasing <strong>${input.title}</strong> in ${input.city}.</p><p>Your branded Opportunity Report is attached. This opportunity is shared with no more than three contractors.</p><p>Please contact the homeowner professionally and use their information only for this project.</p><p>Need help? Email <a href="mailto:${env.SUPPORT_EMAIL}">${env.SUPPORT_EMAIL}</a>.</p>`,
    ),
    attachments: [
      {
        filename: `${input.leadCode}-Opportunity-Report.pdf`,
        path: input.reportPath,
      },
    ],
  });
}

export async function sendAdminSale(input: {
  leadCode: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  amountCents: number;
  spotsRemaining: number;
}) {
  return getTransporter().sendMail({
    from: env.SMTP_FROM,
    to: env.ADMIN_EMAIL,
    subject: `Lead Hippo sale — ${input.leadCode}`,
    html: shell(
      "New opportunity sale",
      `<p><strong>${input.title}</strong> (${input.leadCode}) was purchased.</p><table cellpadding="6"><tr><td>Company</td><td><strong>${input.company}</strong></td></tr><tr><td>Email</td><td>${input.email}</td></tr><tr><td>Phone</td><td>${input.phone}</td></tr><tr><td>Amount</td><td>$${(input.amountCents / 100).toFixed(2)} CAD</td></tr><tr><td>Spots remaining</td><td>${input.spotsRemaining}</td></tr></table>`,
    ),
  });
}

export async function sendContactNotification(input: {
  name: string;
  company: string | null;
  email: string;
  phone: string;
  message: string;
}) {
  return getTransporter().sendMail({
    from: env.SMTP_FROM,
    replyTo: input.email,
    to: env.ADMIN_EMAIL,
    subject: `Lead Hippo contact form — ${input.name}`,
    html: shell(
      "New contact-form submission",
      `<p><strong>${input.name}</strong>${input.company ? ` from ${input.company}` : ""}</p><p>${input.email}<br>${input.phone}</p><p style="white-space:pre-wrap">${escapeHtml(input.message)}</p>`,
    ),
  });
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
