import {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
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

  useEffect(() => {
    setFavoritas(JSON.parse(localStorage.getItem("paradasFavoritas")) || []);
  }, []);

  useEffect(() => {
    const cargarParadas = async () => {
      try {
        const cache = localStorage.getItem("paradasCache");
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

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const b = normalizar(input);
      if (b.length < 3) return setResultado([]);

      const res = [];
      for (let i = 0; i < paradas.length; i++) {
        const p = paradas[i];
        const calle1 = normalizar(p.street1 || "");
        const calle2 = normalizar(p.street2 || "");
        const combinaciones = [
          `${calle1} y ${calle2}`,
          `${calle2} y ${calle1}`,
          calle1,
          calle2,
        ];
        if (combinaciones.some((combo) => combo.includes(b))) {
          res.push(p);
          if (res.length >= 10) break; // máximo 10 resultados para performance
        }
      }
      setResultado(res);
    }, 400);

    return () => clearTimeout(timeoutRef.current);
  }, [input, paradas]);

  const toggleFavorita = (id) => {
    const nuevas = favoritas.includes(id)
      ? favoritas.filter((f) => f !== id)
      : [...favoritas, id];
    setFavoritas(nuevas);
    localStorage.setItem("paradasFavoritas", JSON.stringify(nuevas));
  };

  const CenterOnLocation = () => {
    const map = useMap();
    useEffect(() => {
      if (ubicacion) map.setView(ubicacion, 15);
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
    <section className="mt-12 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        📍 ¿No sabés el número de tu parada?
      </h2>
      <p className="text-center mb-4 text-sm text-gray-600">
        Buscá por nombre de calle o mirá el mapa completo.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: Millán y Herrera"
          className="flex-1 px-4 py-2 border rounded-xl focus:outline-none focus:ring"
        />
        <button
          onClick={() => setParadaEnfocada(null)}
          className="px-4 py-2 bg-black text-white rounded-xl hover:opacity-90 transition"
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
                  <button
                    onClick={() => toggleFavorita(p.busstopId)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Quitar
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default BuscarParada;
