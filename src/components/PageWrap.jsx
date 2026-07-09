import { motion } from "framer-motion";

const PANELS = ["bg-rosso", "bg-carbon"];

/* Route transition: two panels sweep over the page — snappier than the
   old three-panel version so navigation feels instant, not ceremonial. */
export default function PageWrap({ children }) {
  return (
    <>
      {PANELS.map((color, i) => (
        <motion.div
          key={color}
          className={`fixed inset-x-0 top-0 z-[80] h-screen ${color}`}
          style={{ pointerEvents: "none" }}
          initial={{ scaleY: 1, originY: 0 }}
          animate={{ scaleY: 0, originY: 0 }}
          exit={{ scaleY: 1, originY: 1 }}
          transition={{
            duration: 0.42,
            delay: i * 0.07,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
      <motion.main
        id="main"
        tabIndex={-1}
        className="outline-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.45, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </>
  );
}
