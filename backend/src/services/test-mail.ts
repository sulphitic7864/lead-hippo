import nodemailer from "nodemailer";
import { env } from "../config/env.js";

async function testMail() {
  console.log("Testing Lead Hippo SMTP configuration...");

  const missingVariables: string[] = [];

  if (!env.SMTP_HOST) missingVariables.push("SMTP_HOST");
  if (!env.SMTP_USER) missingVariables.push("SMTP_USER");
  if (!env.SMTP_PASSWORD || env.SMTP_PASSWORD === "replace_me") {
    missingVariables.push("SMTP_PASSWORD");
  }
  if (!env.ADMIN_EMAIL) missingVariables.push("ADMIN_EMAIL");

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing SMTP variables: ${missingVariables.join(", ")}`,
    );
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    tls: {
      minVersion: "TLSv1.2",
    },
  });

  console.log(`SMTP host: ${env.SMTP_HOST}`);
  console.log(`SMTP port: ${env.SMTP_PORT}`);
  console.log(`SMTP secure: ${env.SMTP_SECURE}`);
  console.log(`SMTP user: ${env.SMTP_USER}`);

  console.log("Verifying SMTP connection...");

  await transporter.verify();

  console.log("SMTP connection verified successfully.");

  const result = await transporter.sendMail({
    from: env.SMTP_FROM,
    to: env.ADMIN_EMAIL,
    replyTo: env.SUPPORT_EMAIL,
    subject: "Lead Hippo SMTP Test",
    text: [
      "Lead Hippo SMTP test email.",
      "",
      "Your Hostinger SMTP configuration is working successfully.",
    ].join("\n"),
    html: `
      <!doctype html>
      <html>
        <body
          style="
            margin: 0;
            background: #f4f6f8;
            font-family: Arial, sans-serif;
            color: #132032;
          "
        >
          <table
            role="presentation"
            width="100%"
            cellspacing="0"
            cellpadding="0"
          >
            <tr>
              <td align="center" style="padding: 28px">
                <table
                  role="presentation"
                  width="620"
                  cellspacing="0"
                  cellpadding="0"
                  style="
                    max-width: 100%;
                    background: #ffffff;
                    border-radius: 18px;
                    overflow: hidden;
                  "
                >
                  <tr>
                    <td
                      style="
                        background: #0d1b2a;
                        padding: 24px;
                        color: #ffffff;
                        font-size: 22px;
                        font-weight: 700;
                      "
                    >
                      Lead <span style="color: #60a5fa">Hippo</span>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding: 30px">
                      <h1 style="font-size: 24px; margin: 0 0 18px">
                        SMTP Test Successful
                      </h1>

                      <p>
                        Your Hostinger SMTP email configuration is working
                        successfully.
                      </p>

                      <p>
                        Emails can now be sent from
                        <strong>${env.SMTP_USER}</strong>.
                      </p>

                      <p
                        style="
                          margin-top: 28px;
                          color: #64748b;
                          font-size: 13px;
                        "
                      >
                        Lead Hippo · More Leads. More Jobs. More Growth.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  });

  console.log("Email sent successfully.");
  console.log("Message ID:", result.messageId);
  console.log("Recipient:", env.ADMIN_EMAIL);
}

testMail()
  .then(() => {
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Email test failed.");

    if (error instanceof Error) {
      console.error(error.message);
      console.error(error);
    } else {
      console.error(error);
    }

    process.exit(1);
  });