import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import contactoRoutes from './routes/contacto.routes.js';
import DemoRequest from './routes/calendario.routes.js';
import ContactMessageSchema from './models/Contacto.js';
import DemoRequestSchema from './models/Calendario.js';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
// ✅ CORS (SOLO UNA VEZ)
app.use(cors({
  origin: "*",
  credentials: true
}));

// 👇 LOG DE PETICIONES
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// Rutas
app.use('/api/contact', contactoRoutes);
app.use('/api/demo', DemoRequest);

// Middleware para 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de error
app.use((err, req, res, next) => {
  console.error("Error interno:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

const startServer = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("✅ Conectado a MongoDB");

    await ContactMessageSchema.syncIndexes();
    await DemoRequestSchema.syncIndexes();

    console.log("📌 Índices sincronizados");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
};

startServer();

app.use(express.json());
