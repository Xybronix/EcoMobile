// components/ui/ToastContainer.tsx
import React from 'react';
import { Toast, useToasts } from './Toast';

export function ToastContainer() {
  const { toasts, hideToast } = useToasts();

  return (
    <>
      {toasts.map((toastData) => (
        <Toast
          key={toastData.id}
          message={toastData.message}
          type={toastData.type}
          onHide={() => hideToast(toastData.id)}
        />
      ))}
    </>
  );
}