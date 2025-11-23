import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import "./styles/Toast.css";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  actionLabel?: string;
  actionUrl?: string;
}

export function Toast({ message, show, onClose, actionLabel, actionUrl }: ToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="toastWrapper">
          <motion.div
            className="toastContainer"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 30, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="toastMessage">{message}</div>

            {actionLabel && actionUrl && (
              <Link
                to={actionUrl}
                className="toastButton"
                onClick={onClose}
              >
                {actionLabel}
              </Link>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}