import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Icono personalizado simple para no usar imágenes rotas
const paradaIcon = new L.DivIcon({
  className: "bg-white rounded-full border border-black p-[6px] text-xs",
  html: "🅿️",
});

const MapaParadas = ({ onSelectParada }) => {
  const [paradas, setParadas] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchParadas = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/paradas");
        const data = await res.json();
        setParadas(data);
      } catch (err) {
        console.error("Error cargando paradas:", err);
        setError("No se pudieron cargar las paradas");
      }
    };
    fetchParadas();
  }, []);

  return (
    <div className="w-full h-[80vh] rounded-2xl overflow-hidden shadow-xl border">
      {error && (
        <p className="text-center text-red-500 mt-4 text-sm">⚠️ {error}</p>
      )}

      <MapContainer
        center={[-34.9011, -56.1645]} // Centro de Montevideo
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {paradas.map((p) => {
          const [lon, lat] = p.location.coordinates;
          return (
            <Marker
              key={p.busstopId}
              position={[lat, lon]}
              icon={paradaIcon}
              eventHandlers={{
                click: () => {
                  onSelectParada?.(p.busstopId);
                },
              }}
            >
              <Popup>
                <div className="text-sm">
                  <strong>Parada #{p.busstopId}</strong>
                  <br />
                  {p.street1} y {p.street2}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapaParadas;
