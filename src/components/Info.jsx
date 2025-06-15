// src/components/Info.jsx
import { motion } from "framer-motion";

const Info = () => {
  return (
    <section className="mt-20 px-6 max-w-3xl mx-auto text-center">
      <motion.h2
        className="text-2xl sm:text-3xl font-bold mb-4 text-black"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        viewport={{ once: true }}
      >
        ℹ️ Sobre InfoBondi
      </motion.h2>

      <motion.p
        className="text-sm sm:text-base mb-6 text-black"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        viewport={{ once: true }}
      >
        InfoBondi es una plataforma rápida e intuitiva para consultar horarios de
        ómnibus, ubicar paradas y acceder a datos útiles como accesibilidad,
        emisiones y más. Todo en tiempo real, todo en un mismo lugar.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left"
        initial="hidden"
        whileInView="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.15 },
          },
        }}
        viewport={{ once: true }}
      >
        {[
          {
            emoji: "🚌",
            title: "Horarios al instante",
            desc: "Consultá cuándo llega tu bondi, con datos en tiempo real.",
          },
          {
            emoji: "📍",
            title: "Ubicación de paradas",
            desc: "Buscá por calles y encontrá el número de parada fácilmente.",
          },
          {
            emoji: "⭐",
            title: "Favoritos",
            desc: "Guardá tus paradas más usadas y accedé más rápido.",
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="bg-white shadow border rounded-xl p-4 space-y-1"
            variants={{
              hidden: { opacity: 0, y: 15 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-2xl">{item.emoji}</div>
            <h3 className="font-semibold text-black">{item.title}</h3>
            <p className="text-sm text-black">{item.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Info;
