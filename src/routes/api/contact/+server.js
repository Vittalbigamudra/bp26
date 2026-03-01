import nodemailer from "nodemailer";
import db from "$lib/db/sqlite.js";

let transporter;
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

if (SMTP_HOST && SMTP_PORT) {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_PORT === "465",
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
}

export async function POST({ request }) {
  try {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
    }

    const toEmail = "vit_biga05@protonmail.com";

    if (transporter) {
      try {
        await transporter.sendMail({
          from: `${name} <${email}>`,
          to: toEmail,
          subject: `Contact form submission from ${name}`,
          text: `From: ${name} <${email}>\n\n${message}`
        });
      } catch (err) {
        console.error("SMTP error:", err);
      }
    }

    db.query(
      "INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)"
    ).run(name, email, message);

    return new Response(JSON.stringify({ ok: true }));
  } catch (err) {
    console.error("Contact POST error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
