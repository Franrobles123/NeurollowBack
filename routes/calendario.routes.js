import express from "express";
import dotenv from "dotenv";
import DemoRequest from "../models/Calendario.js";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

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

    // 2️⃣ RESPONDER AL FRONT (clave)
    res.status(201).json({
      message: "Demo scheduled successfully",
      demoId: demo._id,
    });

    // 3️⃣ EMAIL EN BACKGROUND (Resend)
    setImmediate(async () => {
      try {
        // Mail interno
        await resend.emails.send({
          from: "Neurollow <onboarding@resend.dev>",
          to: "franrobles377@gmail.com", // o tu mail interno
          subject: `New demo scheduled – ${name}`,
          html: `
            <h2>New Demo Request</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Institution:</strong> ${institution || "N/A"}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p><strong>Date:</strong> ${new Date(date).toDateString()}</p>
            <p><strong>Time:</strong> ${time}</p>
            <p><strong>Message:</strong> ${message || "None"}</p>
          `,
        });

        // Mail al usuario
        await resend.emails.send({
          from: "Neurollow <onboarding@resend.dev>",
          to: email,
          subject: "Your Neurollow demo is scheduled",
          html: `
            <p>Hello ${name},</p>
            <p>Your demo has been successfully scheduled.</p>
            <p><strong>${new Date(date).toDateString()} at ${time}</strong></p>
            <p>Our team will contact you shortly.</p>
            <p>Neurollow Team</p>
          `,
        });

        console.log("📧 Emails enviados con Resend");
      } catch (err) {
        console.error("⚠️ Error enviando mail con Resend:", err.message);
      }
    });

  } catch (error) {
    console.error("❌ Error scheduling demo:", error);
    return res.status(500).json({ error: "Failed to schedule demo" });
  }
});

export default router;

