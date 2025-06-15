// src/components/BuscarParada.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { motion, AnimatePresence } from "framer-motion";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix del icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BuscarParada = () => {
  const [paradas, setParadas] = useState([]);
  const [favoritas, setFavoritas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const timeoutRef = useRef(null);

  // Cargar favoritas
  useEffect(() => {
    const favs = JSON.parse(localStorage.getItem("paradasFavoritas")) || [];
    setFavoritas(favs);
  }, []);

  // Cargar paradas (una sola vez)
  useEffect(() => {
    const cargarParadas = async () => {
      setLoading(true);
      try {
        const cache = localStorage.getItem("paradasCache");
        const data = cache ? JSON.parse(cache) : await (await fetch("http://infobondiapi.ignaciofianza.com/api/paradas")).json();
        if (!cache) localStorage.setItem("paradasCache", JSON.stringify(data));
        setParadas(data);
      } catch (err) {
        console.error("❌ Error al cargar paradas:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarParadas();
  }, []);

  // Busqueda diferida
  const [input, setInput] = useState("");
  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setBusqueda(input.trim().toLowerCase()), 300);
    return () => clearTimeout(timeoutRef.current);
  }, [input]);

  // Resultado memorizado
  const resultado = useMemo(() => {
    if (!paradas.length) return [];

    if (!busqueda) {
      const favs = paradas.filter(p => favoritas.includes(p.busstopId));
      const otras = paradas.filter(p => !favoritas.includes(p.busstopId));
      const extra = otras.sort(() => 0.5 - Math.random()).slice(0, favs.length > 10 ? 3 : 10 - favs.length);
      return [...favs, ...extra];
    }

    return paradas.filter(p =>
      p.street1?.toLowerCase().includes(busqueda) ||
      p.street2?.toLowerCase().includes(busqueda)
    );
  }, [paradas, favoritas, busqueda]);

  const toggleFavorita = (id) => {
    const nuevas = favoritas.includes(id)
      ? favoritas.filter(f => f !== id)
      : [...favoritas, id];
    setFavoritas(nuevas);
    localStorage.setItem("paradasFavoritas", JSON.stringify(nuevas));
  };

  const toggleExpand = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  const renderMapa = (coords) => {
    if (!coords || coords.length !== 2) return null;
    const [lng, lat] = coords;
    return (
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        className="h-48 w-full rounded overflow-hidden border mt-2"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={[lat, lng]}>
          <Popup>Parada aquí</Popup>
        </Marker>
      </MapContainer>
    );
  };

  return (
    <section className="mt-12 px-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">📍 ¿No sabés el número de tu parada?</h2>
      <p className="text-center mb-4 text-sm text-gray-600">
        Buscá por nombre de calle y encontrá tu número de parada.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: 18 de Julio"
          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring"
        />
        <button
          onClick={() => setBusqueda(input.trim().toLowerCase())}
          className="px-4 py-2 bg-black text-white rounded-xl hover:opacity-90 transition"
        >
          Buscar
        </button>
      </div>

      {loading && <p className="text-center text-sm">Cargando paradas...</p>}

      <AnimatePresence>
        {!loading && resultado.length > 0 && (
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {resultado.map((p) => (
              <motion.li
                key={p.busstopId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 border rounded-xl shadow-sm space-y-2"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                  <div>
                    <p className="font-semibold">Parada {p.busstopId}</p>
                    <p className="text-sm text-gray-600">
                      {p.street1} y {p.street2}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleFavorita(p.busstopId)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {favoritas.includes(p.busstopId) ? "★ Favorita" : "☆ Agregar a favoritos"}
                    </button>
                    <button
                      onClick={() => toggleExpand(p.busstopId)}
                      className="text-sm text-gray-600 hover:underline"
                    >
                      {expandedId === p.busstopId ? "Ocultar mapa" : "Ver mapa"}
                    </button>
                  </div>
                </div>
                <AnimatePresence>
                  {expandedId === p.busstopId && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {renderMapa(p.location?.coordinates)}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>

      {!loading && resultado.length === 0 && (
        <p className="text-center text-sm text-gray-500 mt-6">
          No se encontraron paradas.
        </p>
      )}
    </section>
  );
};

export default BuscarParada;
