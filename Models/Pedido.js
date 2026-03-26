const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    usuario: String,
    items: String,
    total: Number,
    estado: String,
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pedido', PedidoSchema);