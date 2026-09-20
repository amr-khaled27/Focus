import { motion } from "framer-motion";

export function PageLoader() {
  return (
    <div
      className="bg-background"
      key="page-loader"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#ffffff",
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        style={{
          width: 48,
          height: 48,
          border: "4px solid rgba(255, 255, 255, 0.1)",
          borderTop: "4px solid #3b82f6",
          borderRadius: "50%",
          marginBottom: 16,
        }}
      />
    </div>
  );
}
