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
      const res = await fetch(
        `https://infobondiapi.ignaciofianza.com/api/parada/${parada}`
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

  return (
    <section id="buscar-bondi" className="mt-12 px-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        ⏱ Próximos ómnibus
      </h2>
      <p className="text-center mb-4 text-sm text-gray-600">
        Consultá cuándo llega el próximo bondi a tu parada.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="number"
          placeholder="Número de parada (ej: 1615)"
          value={parada}
          onChange={(e) => setParada(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") buscar();
          }}
          className="flex-1 px-4 py-2 text-center border rounded-xl focus:outline-none focus:ring"
        />
        <button
          onClick={buscar}
          disabled={loading}
          className="px-4 py-2 bg-black text-white rounded-xl hover:opacity-90 active:scale-95 transition"
        >
          {loading ? "Buscando..." : "Consultar"}
        </button>
      </div>

      {error && (
        <p className="text-center text-red-500 text-sm mb-4">⚠️ {error}</p>
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
              className="space-y-3"
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
                      tag(<span>👨‍🦽‍➡️</span>, item.access)}
                    {item.thermalConfort &&
                      item.thermalConfort.toLowerCase() !== "sin datos" &&
                      tag(<span>❄️</span>, item.thermalConfort)}
                    {item.emissions &&
                      item.emissions.toLowerCase() !== "sin datos" &&
                      tag(<span>🍃</span>, item.emissions)}
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
