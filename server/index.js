const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// CONFIGURACIÓN DE MONGO
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("✅ ¡Conexión exitosa a la Taquería en MongoDB!"))
  .catch(err => {
    console.error("❌ Error de autenticación. Revisa tu usuario/password en el .env");
    console.error(err.message);
  });

// RUTA DE PRUEBA
app.get('/', (req, res) => res.send('Servidor de la Taquería Funcionando 🌮'));

app.use('/api/payments', require('./Routes/payments'));

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor listo en http://localhost:${PORT}`));