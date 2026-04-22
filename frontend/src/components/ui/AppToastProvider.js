import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const ToastContext = createContext(null);

export function AppToastProvider({ children }) {
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = useCallback((message, severity = "info") => {
    setToast({ open: true, message, severity });
  }, []);

  const handleClose = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity={toast.severity} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useAppToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useAppToast must be used inside AppToastProvider");
  }
  return ctx;
}

