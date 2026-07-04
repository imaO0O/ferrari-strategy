import { motion } from "framer-motion";

const PANELS = ["bg-rosso-deep", "bg-rosso", "bg-carbon"];

/* Route transition: staggered vertical panels sweep over the page
   (covering on exit, revealing on enter), landonorris.com-style. */
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
            duration: 0.55,
            delay: i * 0.09,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.2 } }}
        transition={{ duration: 0.6, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </>
  );
}
