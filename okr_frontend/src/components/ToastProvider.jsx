import React, { createContext, useContext, useState, useCallback } from 'react'
import Toast from './Toast'

const ToastContext = createContext(null)

export const useToast = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const send = useCallback((message, type = 'info', timeout = 4000) => {
    const id = Date.now() + Math.random()
    setToasts((t) => [...t, { id, message, type }])
    if (timeout > 0) setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), timeout)
    return id
  }, [])
  const remove = useCallback((id) => setToasts((t) => t.filter(x => x.id !== id)), [])

  return (
    <ToastContext.Provider value={{ send, remove }}>
      {children}
      <div className="fixed right-4 top-4 z-50 w-80">
        {toasts.map((toast) => (
          <Toast key={toast.id} id={toast.id} message={toast.message} type={toast.type} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
