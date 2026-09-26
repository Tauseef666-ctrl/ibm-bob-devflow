import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 4000;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(current => current.filter(t => t.id !== id));
  }, []);

  const push = useCallback((message, variant = 'info', duration = DEFAULT_DURATION) => {
    const id = nextId.current++;
    setToasts(current => [...current, { id, message, variant }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({
    push,
    dismiss,
    success: (m, d) => push(m, 'success', d),
    error:   (m, d) => push(m, 'error', d ?? 6000),
    info:    (m, d) => push(m, 'info', d),
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastRegion({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;
  return (
    <div className="toast-region" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.variant}`}>
          <span style={{ flex: 1 }}>{t.message}</span>
          <button className="toast-close" onClick={() => onDismiss(t.id)} aria-label="Dismiss notification">
            &times;
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside a ToastProvider');
  return ctx;
}
