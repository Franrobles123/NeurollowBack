import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import DemoRequest from "../models/Calendario.js";

dotenv.config();
const router = express.Router();

// POST /api/demo
router.post("/", async (req, res) => {
  const { name, email, institution, role, message, date, time } = req.body;

  if (!name || !email || !role || !date || !time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1️⃣ Guardar en Mongo
    const demo = await DemoRequest.create({
      name,
      email,
      institution,
      role,
      message,
      date,
      time,
    });

    console.log("✅ Demo guardado:", demo._id);

    // 2️⃣ RESPONDER AL FRONTEND Y TERMINAR REQUEST
    res.status(201).json({
      message: "Demo scheduled successfully",
      demoId: demo._id,
    });

    // 3️⃣ MAIL EN BACKGROUND (fuera del flujo HTTP)
    setImmediate(async () => {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
          connectionTimeout: 5000,
        });

        await transporter.sendMail({
          from: `"Neurollow" <${process.env.EMAIL_USER}>`,
          to: process.env.EMAIL_USER,
          subject: `New demo scheduled – ${name}`,
          text: `New demo from ${name} (${email})`,
        });

        await transporter.sendMail({
          from: `"Neurollow" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: "Your Neurollow demo is scheduled",
          text: `Your demo is scheduled for ${time}`,
        });

        console.log("📧 Emails enviados");
      } catch (err) {
        console.error("⚠️ Mail falló (background):", err.message);
      }
    });

  } catch (error) {
    console.error("❌ Error real:", error);
    return res.status(500).json({
      error: "Failed to schedule demo",
    });
  }
});

export default router;

