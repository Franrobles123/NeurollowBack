import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import contactoRoutes from './routes/contacto.routes.js';
import DemoRequest from './models/Calendario.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
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
app.use('/api/demo', calendarioRoutes);

// Middleware para 404
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Middleware de error
app.use((err, req, res, next) => {
  console.error("Error interno:", err.message);
  res.status(500).json({ error: "Error interno del servidor" });
});

// 🟢 Conexión a MongoDB + Server
mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log("Conectado a MongoDB");
    app.listen(PORT, () =>
      console.log(`Servidor corriendo en http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

await Producto.syncIndexes();
app.use(express.json());
