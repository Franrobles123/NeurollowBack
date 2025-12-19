import express from "express";
import dotenv from "dotenv";
import { Resend } from "resend";
import ContactMessage from "../models/Contacto.js";
 
dotenv.config();
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/contact
router.post("/", async (req, res) => {
  const {
    name,
    email,
    institution,
    role,
    inquiryType,
    message,
  } = req.body;

  console.log("📩 New contact message received:", req.body);

  // ✅ Validación primero
  if (!name || !email || !inquiryType || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Guardar en Mongo
    const contact = await ContactMessage.create({
      name,
      email,
      institution,
      role,
      inquiryType,
      message,
    });

    console.log("💾 Contact message saved:", contact._id);

    // 2️⃣ Responder rápido al frontend
    res.status(200).json({
      message: "Contact form submitted successfully",
      contactId: contact._id,
    });

    // 3️⃣ Emails en background (no bloquean)
    setImmediate(async () => {
      try {
        // 📧 Mail interno
        await resend.emails.send({
          from: "Neurollow <onboarding@resend.dev>",
          to: process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER,
          subject: `New ${inquiryType} inquiry from ${name}`,
          html: `
            <h2>New Contact Message</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Institution:</strong> ${institution || "Not specified"}</p>
            <p><strong>Role:</strong> ${role || "Not specified"}</p>
            <p><strong>Inquiry type:</strong> ${inquiryType}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });

        // 💌 Confirmación al usuario
        await resend.emails.send({
          from: "Neurollow <onboarding@resend.dev>",
          to: email,
          subject: "Thank you for contacting Neurollow",
          html: `
            <p>Hello ${name},</p>
            <p>Thank you for reaching out to Neurollow.</p>
            <p>
              We have received your message regarding <strong>${inquiryType}</strong>.
              One of our specialists will respond within <strong>24–48 business hours</strong>.
            </p>
            <p><strong>Summary:</strong></p>
            <ul>
              <li>Institution: ${institution || "Not specified"}</li>
              <li>Role: ${role || "Not specified"}</li>
            </ul>
            <p>Neurollow Team</p>
          `,
        });

        console.log("📧 Contact emails sent via Resend");
      } catch (err) {
        console.error("⚠️ Contact mail error (Resend):", err.message);
      }
    });

  } catch (error) {
    console.error("❌ Contact endpoint error:", error);
    return res.status(500).json({
      error: "Failed to send message",
    });
  }
});


export default router;

