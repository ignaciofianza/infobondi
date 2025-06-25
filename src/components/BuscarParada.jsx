import {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
import LoadingSpinner from "./LoadingSpinner";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const normalizar = (texto) =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\./g, "")
    .replace(/av(da)?\.?/g, "")
    .replace(/dr\.?/g, "")
    .replace(/gral\.?/g, "")
    .replace(/ +/g, " ")
    .trim();

const BuscarParada = () => {
  const [paradas, setParadas] = useState([]);
  const [favoritas, setFavoritas] = useState([]);
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState([]);
  const [ubicacion, setUbicacion] = useState(null);
  const [paradaEnfocada, setParadaEnfocada] = useState(null);
  const timeoutRef = useRef(null);
  const paradasNormalizadas = useRef(new Map());

  // Preprocesar paradas al cargar
  useEffect(() => {
    const procesarParadas = () => {
      const map = new Map();
      paradas.forEach((p, index) => {
        const calle1 = normalizar(p.street1 || "");
        const calle2 = normalizar(p.street2 || "");
        const combinaciones = [
          `${calle1} y ${calle2}`,
          `${calle2} y ${calle1}`,
          calle1,
          calle2,
        ];
        combinaciones.forEach(combo => {
          if (combo) {
            const set = map.get(combo) || new Set();
            set.add(index);
            map.set(combo, set);
          }
        });
      });
      paradasNormalizadas.current = map;
    };
    procesarParadas();
  }, [paradas]);

  useEffect(() => {
    setFavoritas(JSON.parse(localStorage.getItem("paradasFavoritas")) || []);
  }, []);

  useEffect(() => {
    const cargarParadas = async () => {
      try {
        const cache = localStorage.getItem("paradasCache");
        // const data = cache
        //   ? JSON.parse(cache)
        //   : await (await fetch("https://infobondi-back.fly.dev/api/paradas")).json();
        // if (!cache) localStorage.setItem("paradasCache", JSON.stringify(data));
        const data = cache
          ? JSON.parse(cache)
          : await (await fetch("https://infobondi-back.fly.dev/api/paradas")).json();
        if (!cache) localStorage.setItem("paradasCache", JSON.stringify(data));
        setParadas(data);
      } catch (err) {
        console.error("❌ Error al cargar paradas:", err);
      }
    };
    cargarParadas();
  }, []);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUbicacion([pos.coords.latitude, pos.coords.longitude]),
      (err) => console.warn("⚠️ No se pudo obtener ubicación:", err)
    );
  }, []);

  const buscarParadas = useCallback((query) => {
    const normalizedQuery = normalizar(query);
    if (normalizedQuery.length < 3) return [];

    // Buscar en el mapa preprocesado
    const matches = new Set();
    paradasNormalizadas.current.forEach((indices, key) => {
      if (key.includes(normalizedQuery)) {
        indices.forEach(idx => matches.add(idx));
      }
    });

    // Convertir índices a paradas y limitar a 10 resultados
    const resultados = Array.from(matches)
      .map(idx => paradas[idx])
      .slice(0, 10);
    
    return resultados;
  }, [paradas]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const resultados = buscarParadas(input);
      setResultado(resultados);
    }, 400);

    return () => clearTimeout(timeoutRef.current);
  }, [input, buscarParadas]);

  const toggleFavorita = (id) => {
    const nuevas = favoritas.includes(id)
      ? favoritas.filter((f) => f !== id)
      : [...favoritas, id];
    setFavoritas(nuevas);
    localStorage.setItem("paradasFavoritas", JSON.stringify(nuevas));
  };

  // Coordenadas predeterminadas para Mapa
  const coordenadasPredeterminadas = [-34.9057325, -56.1913804];

  const CenterOnLocation = () => {
    const map = useMap();
    useEffect(() => {
      // Si hay ubicación, usarla, sino usar las coordenadas predeterminadas
      const center = ubicacion || coordenadasPredeterminadas;
      map.setView(center, 15);
    }, [ubicacion]);
    return null;
  };

  const CenterOnParada = () => {
    const map = useMap();
    useEffect(() => {
      if (paradaEnfocada) map.setView(paradaEnfocada, 17);
    }, [paradaEnfocada]);
    return null;
  };

  return (
    <section className="mt-8 px-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-3 text-center">
        📍 ¿No sabés el número de tu parada?
      </h2>
      <p className="text-center mb-3 text-xs text-gray-600">
        Buscá por nombre de calle o mirá el mapa completo.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: Millán y Herrera"
          aria-label="Buscar parada por nombre de calle"
          role="search"
          className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none focus:ring focus:ring-blue-500"
        />
        <button
          onClick={() => {
            setParadaEnfocada(null);
            setInput("");
            setResultado([]);
          }}
          aria-label="Limpiar búsqueda"
          className="px-3 py-1.5 bg-black text-white rounded-lg hover:opacity-90 transition"
        >
          Resetear
        </button>
      </div>

      {resultado.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Resultados:</h3>
          <ul className="space-y-2">
            {resultado.map((p) => (
              <li
                key={p.busstopId}
                className="p-3 border rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
              >
                <div>
                  <p className="font-semibold">Parada {p.busstopId}</p>
                  <p className="text-sm text-gray-600">
                    {p.street1} y {p.street2}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleFavorita(p.busstopId)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {favoritas.includes(p.busstopId)
                      ? "★ Favorita"
                      : "☆ Agregar"}
                  </button>
                  <button
                    onClick={() => {
                      const coords = p.location?.coordinates;
                      if (coords?.length === 2) {
                        const [lng, lat] = coords;
                        setParadaEnfocada([lat, lng]);
                      }
                    }}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Ver en mapa
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-8">
        <MapContainer
          center={ubicacion || [-34.9, -56.17]}
          zoom={13}
          scrollWheelZoom
          className="h-96 w-full rounded-xl border shadow-sm"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap"
          />
          <CenterOnLocation />
          <CenterOnParada />
          {ubicacion && (
            <Marker position={ubicacion}>
              <Popup>📍 Estás acá</Popup>
            </Marker>
          )}
          <MarkerClusterGroup>
            {paradas.map((p) => {
              const coords = p.location?.coordinates;
              if (!coords || coords.length !== 2) return null;
              const [lng, lat] = coords;
              return (
                <Marker key={p.busstopId} position={[lat, lng]}>
                  <Popup>
                    Parada {p.busstopId}
                    <br />
                    {p.street1} y {p.street2}
                    <br />
                    <button
                      className="text-blue-600 underline mt-1"
                      onClick={() => toggleFavorita(p.busstopId)}
                    >
                      {favoritas.includes(p.busstopId)
                        ? "★ Favorita"
                        : "☆ Agregar a favoritos"}
                    </button>
                  </Popup>
                </Marker>
              );
            })}
          </MarkerClusterGroup>
        </MapContainer>
      </div>

      {favoritas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">
            ⭐ Tus paradas favoritas:
          </h3>
          <ul className="space-y-2">
            {paradas
              .filter((p) => favoritas.includes(p.busstopId))
              .map((p) => (
                <li
                  key={p.busstopId}
                  className="p-3 border rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">Parada {p.busstopId}</p>
                    <p className="text-sm text-gray-600">
                      {p.street1} y {p.street2}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => toggleFavorita(p.busstopId)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Quitar
                    </button>
                    <button
                      onClick={() => {
                        const coords = p.location?.coordinates;
                        if (coords?.length === 2) {
                          const [lng, lat] = coords;
                          setParadaEnfocada([lat, lng]);
                        }
                      }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Ver en mapa
                    </button>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default BuscarParada;
