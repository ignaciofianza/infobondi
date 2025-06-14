// src/components/Navbar.jsx
import { useState } from 'react';

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 left-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-xl font-bold text-black">InfoBondi</div>
        
        <button
          className="sm:hidden text-gray-700"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? '✖' : '☰'}
        </button>

        <ul
          className={`sm:flex sm:items-center sm:gap-8 absolute sm:static top-full left-0 w-full bg-white sm:w-auto transition-all duration-300 ease-in ${
            open ? 'block' : 'hidden'
          }`}
        >
          <li>
            <a href="#inicio" className="block px-4 py-2 hover:text-blue-600">
              Inicio
            </a>
          </li>
          <li>
            <a href="#lineas" className="block px-4 py-2 hover:text-blue-600">
              Líneas
            </a>
          </li>
          <li>
            <a href="#contacto" className="block px-4 py-2 hover:text-blue-600">
              Contacto
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
