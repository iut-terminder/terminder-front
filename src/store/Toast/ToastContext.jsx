import React, { createContext, useCallback, useRef, useState } from 'react';

const ToastContext = createContext({
    showToast: (message, type) => {},
});

let idCounter = 0;

export const ToastContextProvider = (props) => {
    const [toasts, setToasts] = useState([]);
    const timers = useRef({});

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
        if (timers.current[id]) {
            clearTimeout(timers.current[id]);
            delete timers.current[id];
        }
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        timers.current[id] = setTimeout(() => removeToast(id), duration);
    }, [removeToast]);

    const contextValue = {
        showToast,
    };

    return (
        <ToastContext.Provider value={contextValue}>
            {props.children}
            <div className='toast_container'>
                {toasts.map((toast) => (
                    <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                        <span className='toast-icon'>{toast.type === 'error' ? '❌' : '✅'}</span>
                        <span className='toast-message'>{toast.message}</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export default ToastContext;
