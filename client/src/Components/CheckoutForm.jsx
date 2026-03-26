import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useState } from 'react';
import { auth } from '../firebaseConfig';

export default function CheckoutForm({ total, cantidad, setIsPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setCargando(true);

    // 1. Crear el método de pago con la tarjeta ingresada
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement),
    });

    if (error) {
      console.error(error);
      alert("Error: " + error.message);
      setCargando(false);
    } else {
      try {
        // 2. Extraer datos del usuario y del pedido
        const userEmail = auth.currentUser ? auth.currentUser.email : "Invitado";
        const detallePedido = `${cantidad} Tacos al Pastor`;

        // 3. Enviar al Backend (Puerto 3000)
        const { data } = await axios.post('http://52.23.249.55:3000/api/payments/checkout', {
          id: paymentMethod.id,
          amount: total, // Ya viene en centavos desde App.jsx
          userEmail: userEmail,
          items: detallePedido
        });

       if (data.success) {
            setIsPaid(true); 
            alert("¡Pago realizado con éxito!"); 
        } else {
            alert("El pago no pudo procesarse: " + data.message);
        } 
    } catch (err) {
        console.error("Error en la conexión con el servidor", err);
        alert("Error crítico en el servidor.");
      }
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyles}>
      <div style={cardContainerStyles}>
        <CardElement options={cardElementOptions} />
      </div>
      
      <button 
        type="submit" 
        disabled={!stripe || cargando} 
        style={cargando ? {...btnStyles, opacity: 0.6} : btnStyles}
      >
        {cargando ? (
          <><i className="fa-solid fa-spinner fa-spin"></i> Procesando...</>
        ) : (
          <><i className="fa-solid fa-check"></i> Confirmar Pago de ${(total/100).toFixed(2)}</>
        )}
      </button>
      
      <p style={secureText}>
        <i className="fa-solid fa-lock"></i> Pago encriptado y seguro por Stripe
      </p>
    </form>
  );
}

// --- ESTILOS ---
const formStyles = {
  marginTop: '20px',
  width: '100%'
};

const cardContainerStyles = {
  padding: '15px',
  border: '2px solid #eee',
  borderRadius: '12px',
  backgroundColor: '#fff'
};

const btnStyles = {
  marginTop: '20px',
  width: '100%',
  padding: '15px',
  backgroundColor: '#27ae60',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1.1rem',
  fontWeight: 'bold',
  cursor: 'pointer',
  transition: '0.3s'
};

const secureText = {
  textAlign: 'center',
  fontSize: '0.8rem',
  color: '#888',
  marginTop: '10px'
};

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': { color: '#aab7c4' },
    },
    invalid: { color: '#9e2146' },
  },
};