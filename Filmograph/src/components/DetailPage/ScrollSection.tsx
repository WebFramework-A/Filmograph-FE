import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function ScrollSection({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
<motion.div
  ref={ref}
  initial={{ opacity: 0, translateY: 50 }}
  animate={isInView ? { opacity: 1, translateY: 0 } : {}}
  transition={{ duration: 0.8, delay }}
>
      {children}
    </motion.div>
  );
}