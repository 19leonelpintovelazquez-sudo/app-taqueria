const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Pedido = require('../Models/Pedido'); // Asegúrate de que este archivo exista

router.post('/checkout', async (req, res) => {
    const { amount, id, userEmail, items } = req.body;
    try {
        // 1. Intentar el cobro en Stripe
        await stripe.paymentIntents.create({
            amount,
            currency: "MXN",
            payment_method: id,
            confirm: true,
            return_url: "http://localhost:5173"
        });

        // 2. Si el pago fue exitoso, guardamos en MongoDB (Módulo de Persistencia)
        const nuevoPedido = new Pedido({
            usuario: userEmail,
            items: items,
            total: amount / 100, // Convertimos de centavos a pesos
            estado: 'Pagado'
        });
        await nuevoPedido.save();

        res.json({ message: "Pago y pedido guardados", success: true });
    } catch (error) {
        res.json({ message: error.message, success: false });
    }
});

module.exports = router;