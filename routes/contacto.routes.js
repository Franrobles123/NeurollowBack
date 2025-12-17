import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

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

  // Validación básica
  if (!name || !email || !inquiryType || !message) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    // Transporter (Gmail con App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    /* ===========================
       📧 Email interno (Admin)
       =========================== */
    const mailAdmin = {
      from: `"Neurollow Contact Form" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New ${inquiryType} inquiry from ${name}`,
      text: `
New message received via Neurollow contact form

Name: ${name}
Email: ${email}
Institution: ${institution || "Not specified"}
Role: ${role || "Not specified"}
Inquiry type: ${inquiryType}

Message:
${message}
      `,
    };

    /* ===========================
       💌 Confirmación al usuario
       =========================== */
    const mailUser = {
      from: `"Neurollow Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Thank you for contacting Neurollow",
      text: `
Hello ${name},

Thank you for reaching out to Neurollow.

We have successfully received your message and one of our clinical or technical specialists
will review your inquiry and respond within 24–48 business hours.

Summary of your inquiry:
• Type: ${inquiryType}
• Institution: ${institution || "Not specified"}
• Role: ${role || "Not specified"}

If you have additional information to share, feel free to reply to this email.

Kind regards,
Neurollow Team
      `,
    };

    // Enviar correos
    await transporter.sendMail(mailAdmin);
    await transporter.sendMail(mailUser);

    console.log("✅ Contact emails sent successfully");

    res.json({
      message: "Contact form submitted successfully",
    });

  } catch (error) {
    console.error("❌ Error sending contact emails:", error);
    res.status(500).json({
      error: "Failed to send message",
    });
  }
});

export default router;
