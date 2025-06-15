import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ onScrollTo }) => {
  const [open, setOpen] = useState(false);

  const handleClick = (seccion) => {
    setOpen(false);
    onScrollTo[seccion]?.();
  };

  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="bg-white/80 backdrop-blur-sm border-b border-neutral-200 fixed w-full top-0 left-0 z-[9999]"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="flex items-center gap-2">
          <img
            src="/images/infobondi_nobg.png"
            alt="InfoBondi"
            className="h-10 sm:h-12"
          />
          <span className="hidden sm:inline font-semibold text-sm tracking-tight text-black">
            InfoBondi
          </span>
        </a>

        <button
          className="sm:hidden text-black text-2xl"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>

        <ul className="sm:flex sm:items-center sm:gap-8 hidden sm:block">
          <li>
            <button
              onClick={() => handleClick("horarios")}
              className="block px-4 py-2 text-sm font-medium hover:opacity-70 transition"
            >
              Horarios
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("paradas")}
              className="block px-4 py-2 text-sm font-medium hover:opacity-70 transition"
            >
              Paradas
            </button>
          </li>
          <li>
            <button
              onClick={() => handleClick("contacto")}
              className="block px-4 py-2 text-sm font-medium hover:opacity-70 transition"
            >
              Info
            </button>
          </li>
        </ul>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden px-4 pb-4 bg-white border-t border-neutral-200"
          >
            <li>
              <button
                onClick={() => handleClick("horarios")}
                className="block py-2 text-sm font-medium hover:opacity-70 transition"
              >
                Horarios
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick("paradas")}
                className="block py-2 text-sm font-medium hover:opacity-70 transition"
              >
                Paradas
              </button>
            </li>
            <li>
              <button
                onClick={() => handleClick("contacto")}
                className="block py-2 text-sm font-medium hover:opacity-70 transition"
              >
                Info
              </button>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
