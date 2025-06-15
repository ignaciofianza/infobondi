// App.jsx
import { useRef } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BuscarBondi from "./components/BuscarBondi";
import BuscarParada from "./components/BuscarParada";
import Info from "./components/Info";
import Footer from "./components/Footer";

const App = () => {
  const refHorarios = useRef(null);
  const refParadas = useRef(null);
  const refContacto = useRef(null);

  return (
    <>
      <Navbar
        onScrollTo={{
          horarios: () =>
            refHorarios.current?.scrollIntoView({ behavior: "smooth" }),
          paradas: () =>
            refParadas.current?.scrollIntoView({ behavior: "smooth" }),
          contacto: () =>
            refContacto.current?.scrollIntoView({ behavior: "smooth" }),
        }}
      />
      <Hero />
      <div ref={refHorarios} className="pt-24">
        <BuscarBondi />
      </div>
      <div ref={refParadas} className="pt-24">
        <BuscarParada />
      </div>
      <div
        ref={refContacto}
        className="pt-24 pb-10 text-center text-gray-600 text-sm"
      >
        <Info />
      </div>
      <Footer />
    </>
  );
};

export default App;
