import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet/dist/leaflet.css';

// Ubicación real en Colonia Indeco, Tapachula
const POS_TAQUERIA = [14.8844905, -92.2647904]; 

const RoutingMachine = ({ destinoCoordenadas, setTiempo }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !destinoCoordenadas) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(POS_TAQUERIA[0], POS_TAQUERIA[1]),
        L.latLng(destinoCoordenadas[0], destinoCoordenadas[1])
      ],
      lineOptions: { styles: [{ color: '#D32F2F', weight: 6 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false, // ESTO QUITA LAS LETRAS Y EL PANEL DE INSTRUCCIONES
      createMarker: () => null, // Opcional: limpia marcadores extra del routing
    }).addTo(map);

    routingControl.on('routesfound', (e) => {
      setTiempo(Math.round(e.routes[0].summary.totalTime / 60));
    });

    return () => map.removeControl(routingControl);
  }, [map, destinoCoordenadas]);

  return null;
};

const Mapa = ({ destinoCoordenadas, setTiempo }) => {
  return (
    <MapContainer center={POS_TAQUERIA} zoom={14} style={{ height: '350px', width: '100%', borderRadius: '15px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <RoutingMachine destinoCoordenadas={destinoCoordenadas} setTiempo={setTiempo} />
    </MapContainer>
  );
};

export default Mapa;