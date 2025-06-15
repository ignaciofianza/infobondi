// src/components/Footer.jsx
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <motion.footer
      className="mt-20 px-6 py-8 text-center text-sm text-black border-t border-neutral-200"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <p className="mb-2">
        © {new Date().getFullYear()} InfoBondi. Derechos reservados.
      </p>
      <p className="mb-2">
        Datos proporcionados por la I.M.M.
      </p>
      <p className="text-xs text-black">
        Hecho con ❤️ por{" "}
        <a
          href="https://ignaciofianza.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium hover:opacity-80 transition"
        >
          Ignacio Fianza
        </a>
        .
      </p>
    </motion.footer>
  );
};

export default Footer;
