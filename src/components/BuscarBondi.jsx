import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BuscarBondi = () => {
  const [parada, setParada] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscar = async () => {
    if (!parada) {
      setError("Ingresá un número de parada");
      return;
    }

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      const res = await fetch(`http://192.168.1.18:3001/api/parada/${parada}`);
      if (!res.ok) throw new Error("No se pudo obtener la información de la parada");

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

  return (
    <div className="max-w-md mx-auto px-6 py-8 rounded-2xl shadow-xl backdrop-blur-md border shadow-lg">
      <h2 className="text-2xl font-semibold text-center mb-6">⏱ Próximos ómnibus</h2>

      <input
        type="number"
        placeholder="Número de parada (ej: 1615)"
        value={parada}
        onChange={(e) => setParada(e.target.value)}
        className="w-full text-center text-lg px-4 py-2 rounded-xl border mb-4 focus:outline-none focus:ring transition"
      />

      <button
        onClick={buscar}
        disabled={loading}
        className="w-full py-2.5 rounded-xl text-white bg-black hover:opacity-90 active:scale-[0.95] transition"
      >
        {loading ? "Buscando..." : "Consultar parada"}
      </button>

      {error && <p className="mt-4 text-red-500 text-center text-sm">⚠️ {error}</p>}

      <AnimatePresence>
        {resultado && (
          <>
            {!resultado.length && !loading && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-6 text-center text-sm"
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
              className="mt-1 space-y-3"
            >
              {resultado.map((item, index) => (
                <motion.div
                  key={index}
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
                  className="p-4 rounded-xl border shadow-sm "
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
                        ⏳ Llega en <strong>{Math.round(item.eta / 60)} min</strong> ({item.eta} seg)
                      </div>
                    )}
                    {item.access && item.access !== "Sin datos" && tag(<span>👨‍🦽‍➡️</span>, item.access)}
                    {item.thermalConfort && item.thermalConfort !== "Sin datos" &&
                      tag(<span>❄️</span>, item.thermalConfort)}
                    {item.emissions && item.emissions !== "Sin datos" &&
                      tag(<span>🍃</span>, item.emissions)}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuscarBondi;
