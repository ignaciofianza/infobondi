import React from "react";
import Navbar from "./components/navbar";
import Hero from "./components/Hero";
import BuscarBondi from "./components/BuscarBondi";

const App = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <div id="buscar-bondi" className="pt-20">
        <BuscarBondi />
      </div>
    </>
  );
};

export default App;
