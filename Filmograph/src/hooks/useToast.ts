import { useState } from "react";

export const useToast = () => {
  const [toast, setToast] = useState<{
    message: string;
    show: boolean;
    actionLabel?: string;
    actionUrl?: string;
  }>({ message: "", show: false });

  const showToast = (
    message: string,
    actionLabel?: string,
    actionUrl?: string
  ) => {
    setToast({ message, show: true, actionLabel, actionUrl });

    setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 2500);
  };

  return { toast, showToast };
};