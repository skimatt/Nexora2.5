import React from "react";
import { motion } from "framer-motion";

const WelcomePage = ({ session }) => {
  // Ambil nama dari email, hilangkan angka dan kapitalisasi huruf pertama
  const userName = session?.user?.email
    ? session.user.email
        .split("@")[0]
        .replace(/[0-9]/g, "")
        .replace(/^\w/, (c) => c.toUpperCase())
    : "Pengguna";

  // Fungsi untuk menentukan waktu sapaan
  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Pagi";
    if (hour >= 12 && hour < 15) return "Siang";
    if (hour >= 15 && hour < 18) return "Sore";
    return "Malam";
  };

  return (
    <div className="flex flex-col items-center justify-start h-screen px-6 bg-transparent">
      <div className="mt-48 w-full max-w-xl">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.h1
            className="text-3xl font-bold text-white tracking-tight flex justify-center items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {getTimeGreeting()},
            <span className="text-4xl font-extrabold">{userName}</span>
          </motion.h1>

          {/* Tambahan kalimat "Mau aku bantuin apa hari ini?" */}
          <motion.p
            className="text-lg text-white mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            Mau aku bantuin apa hari ini?
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default WelcomePage;
