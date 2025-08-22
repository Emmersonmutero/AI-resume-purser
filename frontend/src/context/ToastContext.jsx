import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  LOADING: 'loading'
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback(({
    message,
    type = TOAST_TYPES.INFO,
    duration = 5000,
    persistent = false,
    action = null
  }) => {
    const id = ++toastIdRef.current;
    const toast = {
      id,
      message,
      type,
      duration,
      persistent,
      action,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration (unless persistent)
    if (!persistent && duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, ...updates } : toast
    ));
  }, []);

  // Convenience methods for different toast types
  const success = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.SUCCESS, ...options });
  }, [addToast]);

  const error = useCallback((message, options = {}) => {
    return addToast({ 
      message, 
      type: TOAST_TYPES.ERROR, 
      duration: 8000, // Longer for errors
      ...options 
    });
  }, [addToast]);

  const warning = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.WARNING, ...options });
  }, [addToast]);

  const info = useCallback((message, options = {}) => {
    return addToast({ message, type: TOAST_TYPES.INFO, ...options });
  }, [addToast]);

  const loading = useCallback((message, options = {}) => {
    return addToast({ 
      message, 
      type: TOAST_TYPES.LOADING, 
      persistent: true,
      ...options 
    });
  }, [addToast]);

  // Promise-based toast for async operations
  const promise = useCallback(async (
    promiseOrFunction,
    {
      loading: loadingMessage = 'Loading...',
      success: successMessage = 'Success!',
      error: errorMessage = 'Something went wrong!'
    } = {}
  ) => {
    const loadingId = loading(loadingMessage);
    
    try {
      const result = typeof promiseOrFunction === 'function' 
        ? await promiseOrFunction() 
        : await promiseOrFunction;
      
      removeToast(loadingId);
      success(typeof successMessage === 'function' ? successMessage(result) : successMessage);
      
      return result;
    } catch (err) {
      removeToast(loadingId);
      error(typeof errorMessage === 'function' ? errorMessage(err) : errorMessage);
      throw err;
    }
  }, [loading, removeToast, success, error]);

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    updateToast,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    TOAST_TYPES
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const getIcon = (type) => {
    switch (type) {
      case TOAST_TYPES.SUCCESS:
        return '✅';
      case TOAST_TYPES.ERROR:
        return '❌';
      case TOAST_TYPES.WARNING:
        return '⚠️';
      case TOAST_TYPES.LOADING:
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  const handleAction = () => {
    if (toast.action?.handler) {
      toast.action.handler();
    }
    if (toast.action?.dismiss !== false) {
      onRemove();
    }
  };

  return (
    <div 
      className={`toast toast--${toast.type}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast__content">
        <span className="toast__icon" aria-hidden="true">
          {getIcon(toast.type)}
        </span>
        <span className="toast__message">{toast.message}</span>
      </div>
      
      <div className="toast__actions">
        {toast.action && (
          <button 
            className="toast__action-button"
            onClick={handleAction}
          >
            {toast.action.label}
          </button>
        )}
        
        {!toast.persistent && (
          <button 
            className="toast__close"
            onClick={onRemove}
            aria-label="Close notification"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export { TOAST_TYPES };
