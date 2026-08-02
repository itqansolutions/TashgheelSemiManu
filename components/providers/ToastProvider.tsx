"use client";

import { Toaster } from "sonner";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      richColors
      closeButton
      dir="rtl"
      toastOptions={{
        style: {
          fontFamily: "var(--font-tajawal)",
          fontSize: "14px",
        },
      }}
    />
  );
}
