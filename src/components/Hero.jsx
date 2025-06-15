import { motion } from "framer-motion";

const Hero = () => {
  const scrollToBuscarBondi = () => {
    const target = document.getElementById("buscar-bondi");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <motion.section
      className="flex flex-col items-center justify-center min-h-[40vh] pt-24 px-4 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        className="text-4xl sm:text-5xl font-extrabold mb-4 max-w-xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        Tu web para saber todo sobre los bondis de Montevideo
      </motion.h1>

      <motion.p
        className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        Información rápida junto a una experiencia que te hace sentir en casa.
      </motion.p>

      <motion.button
        className="bg-black text-white px-6 py-2.5 rounded-xl font-medium hover:bg-gray-800 transition cursor-pointer"
        onClick={scrollToBuscarBondi}
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
      >
        Empezar Ahora
      </motion.button>
    </motion.section>
  );
};

export default Hero;
