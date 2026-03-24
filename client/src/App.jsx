import { useState } from 'react';
import { auth, provider } from './firebaseConfig';
import { signInWithPopup, signOut } from 'firebase/auth';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './Components/CheckoutForm';
import Mapa from './Components/Mapa';
import './App.css';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Datos simulados para la demostración del historial
const HISTORIAL_DEMO = [
  { id: 'SAN-9921', fecha: '23/03/2026', total: 125, items: '4 Tacos, 1 Coca', estado: 'Entregado' },
  { id: 'SAN-9925', fecha: 'Hoy', total: 95, items: '1 Alambre', estado: 'En cocina' }
];

function App() {
  const [user, setUser] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [destinoCoords, setDestinoCoords] = useState(null);
  const [tiempoEstimado, setTiempoEstimado] = useState(0);
  const [direccion, setDireccion] = useState('');
  const [carrito, setCarrito] = useState({ tacos: 0, alambre: 0, tortaPastor: 0, tortaEspecial: 0, tortaCombinada: 0, coca: 0, aguaSabor: 0 });

  const PRECIOS = { tacos: 25, alambre: 95, tortaPastor: 60, tortaEspecial: 85, tortaCombinada: 75, coca: 20, aguaSabor: 25 };

  const handleLogin = () => signInWithPopup(auth, provider).then(res => setUser(res.user));
  const handleLogout = () => { signOut(auth).then(() => { setUser(null); setIsPaid(false); setDestinoCoords(null); }); };

  const modificarCantidad = (producto, op) => {
    setCarrito(prev => ({ ...prev, [producto]: op === 'sumar' ? prev[producto] + 1 : Math.max(0, prev[producto] - 1) }));
  };

  const totalPagar = Object.keys(carrito).reduce((acc, p) => acc + (carrito[p] * PRECIOS[p]), 0);

  const buscarDireccion = async () => {
    if (!direccion) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(direccion + ", Tapachula")}`);
      const data = await res.json();
      if (data.length > 0) setDestinoCoords([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1 className="logo">Taquería <span>Sanchino</span></h1>
        {!user ? (
          <button onClick={handleLogin} className="btn-login-main">¡ENTRAR PARA ORDENAR!</button>
        ) : (
          <div className="user-nav">
            <span>Hola, {user.displayName}</span>
            <button onClick={handleLogout} className="btn-logout">Salir</button>
          </div>
        )}
      </header>

      <main className="main-content">
        <section className="card card-menu">
          <h2 className="section-title"><i className="fa-solid fa-utensils"></i> Menú</h2>
          {Object.keys(PRECIOS).map(p => (
            <div key={p} className="menu-item-row">
              <span className="item-name">{p.toUpperCase()}</span>
              {user && !isPaid && (
                <div className="stepper">
                  <button onClick={() => modificarCantidad(p, 'restar')}>-</button>
                  <span>{carrito[p]}</span>
                  <button onClick={() => modificarCantidad(p, 'sumar')}>+</button>
                </div>
              )}
              <span className="item-price">${PRECIOS[p]}</span>
            </div>
          ))}
          {user && totalPagar > 0 && !isPaid && (
            <div className="checkout-zone">
              <h3>Total: ${totalPagar}</h3>
              <Elements stripe={stripePromise}>
                <CheckoutForm total={totalPagar * 100} setIsPaid={setIsPaid} />
              </Elements>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="section-title"><i className="fa-solid fa-motorcycle"></i> Envío</h2>
          <Mapa destinoCoordenadas={destinoCoords} setTiempo={setTiempoEstimado} />
          {user && (
            <div className="delivery-box">
              <div className="search-bar">
                <input type="text" placeholder="Dirección en Tapachula..." value={direccion} onChange={(e) => setDireccion(e.target.value)} />
                <button onClick={buscarDireccion} className="btn-go"><i className="fa-solid fa-paper-plane"></i></button>
              </div>
              {tiempoEstimado > 0 && (
                <div className="eta-badge"><i className="fa-solid fa-clock"></i> Llega en: <strong>{tiempoEstimado + 10} min</strong></div>
              )}
            </div>
          )}
        </section>
      </main>

      {user && (
        <section className="card history-card">
          <h2 className="section-title"><i className="fa-solid fa-history"></i> Historial de Pedidos</h2>
          <div className="history-list">
            {HISTORIAL_DEMO.map(ped => (
              <div key={ped.id} className="history-item">
                <div className="ped-info"><strong>{ped.fecha}</strong><small>{ped.id}</small></div>
                <div className="ped-items">{ped.items}</div>
                <div className="ped-meta"><strong>${ped.total}</strong><span className="badge">{ped.estado}</span></div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;