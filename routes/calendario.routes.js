import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import DemoRequest from "../models/Calendario.js";

dotenv.config();
const router = express.Router();

// POST /api/demo
router.post("/", async (req, res) => {
  const {
    name,
    email,
    institution,
    role,
    message,
    date,
    time,
  } = req.body;

  if (!name || !email || !role || !date || !time) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  try {
    /* ===========================
       💾 Guardar en Mongo
       =========================== */
    const demo = await DemoRequest.create({
      name,
      email,
      institution,
      role,
      message,
      date,
      time,
    });

    /* ===========================
       📧 Emails
       =========================== */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Email interno (Neurollow)
    await transporter.sendMail({
      from: `"Neurollow Demo Scheduler" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `New demo scheduled – ${name}`,
      text: `
New demo request received

Name: ${name}
Email: ${email}
Institution: ${institution || "Not specified"}
Role: ${role}

Scheduled date: ${new Date(date).toLocaleDateString()}
Time: ${time}

Message:
${message || "No additional message"}
      `,
    });

    // Confirmación usuario
    await transporter.sendMail({
      from: `"Neurollow Team" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Neurollow demo is scheduled",
      text: `
Hello ${name},

Thank you for scheduling a demo with Neurollow.

📅 Date: ${new Date(date).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })}
⏰ Time: ${time}

One of our specialists will contact you shortly with meeting details.

Kind regards,
Neurollow Team
      `,
    });

    res.status(201).json({
      message: "Demo scheduled successfully",
      demoId: demo._id,
    });

  } catch (error) {
    console.error("❌ Demo scheduling error:", error);
    res.status(500).json({
      error: "Failed to schedule demo",
    });
  }
});

export default router;
