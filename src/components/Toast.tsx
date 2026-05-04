import React from 'react';

interface ToastProps {
  toast: string;
}

export function Toast({ toast }: ToastProps) {
  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 bg-green-brand text-bg0 font-bold px-6 py-2.5 rounded-lg shadow-2xl transition-all z-50 ${toast ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"}`}>
      {toast}
    </div>
  );
}
