import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { ToastProvider, useToast } from './toast';

function ToastContainer() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 rtl:right-auto rtl:left-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'pointer-events-auto relative flex w-full max-w-sm items-center justify-between overflow-hidden rounded-lg border p-4 shadow-lg transition-all animate-in slide-in-from-bottom-5',
            toast.variant === 'destructive' && 'border-destructive bg-destructive text-destructive-foreground',
            toast.variant === 'success' && 'border-green-500 bg-green-500 text-white',
            (!toast.variant || toast.variant === 'default') && 'border bg-background text-foreground'
          )}
        >
          <div className="flex-1">
            {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
            {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
          </div>
          <button onClick={() => dismiss(toast.id)} className="ml-2 rtl:ml-0 rtl:mr-2">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function Toaster() {
  return (
    <ToastProvider>
      <ToastContainer />
    </ToastProvider>
  );
}
