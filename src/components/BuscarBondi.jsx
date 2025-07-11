// src/components/BuscarBondi.jsx
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import LoadingSpinner from "./LoadingSpinner";

// Fix del icono de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const BuscarBondi = () => {
  const [parada, setParada] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const buscar = async () => {
    if (!parada) {
      setError("Ingresá un número de parada");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(
        // `https://infobondi-back.fly.dev/api/parada/${parada}`
        `https://infobondi-back.fly.dev/api/parada/${parada}`
      );
      if (!res.ok)
        throw new Error("No se pudo obtener la información de la parada");

      const data = await res.json();
      setResultado(data);
    } catch (e) {
      console.error("Error completo:", e);
      setError(e.message || "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const tag = (icon, value) => (
    <div className="flex items-center gap-1 text-sm">
      {icon} <span>{value}</span>
    </div>
  );

  const renderMapa = (coords) => {
    if (!coords || coords.length !== 2) return null;
    const [lng, lat] = coords;
    return (
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        scrollWheelZoom={false}
        className="h-48 w-full rounded overflow-hidden border mt-2"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap"
        />
        <Marker position={[lat, lng]}>
          <Popup>Última ubicación del bus</Popup>
        </Marker>
      </MapContainer>
    );
  };

  return (
    <section id="buscar-bondi" className="mt-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-3 text-center">
        ⌛ Próximos ómnibus
      </h2>
      <p className="text-center mb-3 text-xs text-gray-600">
        Consultá cuándo llega el próximo bondi a tu parada.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="number"
          placeholder="Número de parada (ej: 1615)"
          value={parada}
          onChange={(e) => setParada(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && buscar()}
          ref={inputRef}
          aria-label="Número de parada a buscar"
          role="search"
          className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button
          onClick={buscar}
          disabled={loading}
          className="px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-90 transition"
          aria-label="Buscar bondis"
        >
          {loading ? <LoadingSpinner size={20} /> : "Consultar"}
        </button>
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="text-center text-red-500 text-sm mb-4"
          role="alert"
        >
          ⚠️ {error}
        </motion.p>
      )}

      <AnimatePresence>
        {resultado && (
          <>
            {!resultado.length && !loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-center text-sm text-gray-600"
              >
                😕 No hay bondis en camino por ahora.
              </motion.p>
            )}

            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              className="space-y-4"
            >
              {resultado.map((item, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="p-4 border rounded-xl shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-medium text-base">
                      <span>🚍</span> Línea {item.line}
                    </div>
                    <span className="text-sm">{item.companyName}</span>
                  </div>

                  <div className="text-sm space-y-1">
                    {item.origin && item.destination && (
                      <div className="flex items-center gap-1">
                        <span>📍</span>
                        {item.origin} → {item.destination}
                      </div>
                    )}

                    {item.eta && (
                      <div>
                        ⏳ Llega en{" "}
                        <strong>{Math.round(item.eta / 60)} min</strong> (
                        {item.eta} seg)
                      </div>
                    )}

                    {item.access &&
                      item.access.toLowerCase() !== "sin datos" &&
                      tag("👨‍🦽", item.access)}
                    {item.thermalConfort &&
                      item.thermalConfort.toLowerCase() !== "sin datos" &&
                      tag("❄️", item.thermalConfort)}
                    {item.emissions &&
                      item.emissions.toLowerCase() !== "sin datos" &&
                      tag("🍃", item.emissions)}

                    {item.location?.coordinates &&
                      renderMapa(item.location.coordinates)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BuscarBondi;
