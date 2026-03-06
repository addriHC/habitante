'use client'

import { useState, useRef, useEffect } from 'react'

export function StatusPill({ status }) {
    const labels = {
        published: 'Publicado',
        draft: 'Borrador',
        archived: 'Archivado'
    }
    return (
        <span className={`bo-status-pill bo-status-${status}`}>
            {labels[status] || status}
        </span>
    )
}

export function FormField({ label, name, type = 'text', children, icon, error, ...props }) {
    return (
        <label className="bo-field">
            <span className="bo-field-label">
                {icon && <span className="material-symbols-outlined">{icon}</span>}
                {label}
            </span>
            {children || (
                <input
                    name={name}
                    type={type}
                    className={`bo-input ${error ? 'error' : ''}`}
                    {...props}
                />
            )}
            {error && <span className="bo-field-error">{error}</span>}
        </label>
    )
}

export function FormSection({ title, children, fullWidth = false }) {
    return (
        <div className={`bo-form-section ${fullWidth ? 'bo-field-full' : ''}`}>
            {title && <h3 className="bo-form-title">{title}</h3>}
            <div className="bo-form-section-content">
                {children}
            </div>
        </div>
    )
}

export function ActionButton({ label, icon, variant = 'primary', onClick, type = 'button', disabled = false, href, className = '' }) {
    const baseClass = variant === 'primary' ? 'bo-btn' : 'bo-ghost-btn'
    const finalClass = `${baseClass} ${className}`.trim()
    const content = (
        <>
            {icon && <span className="material-symbols-outlined">{icon}</span>}
            {label && <span className="bo-btn-label">{label}</span>}
        </>
    )

    if (href) {
        return <a href={href} className={finalClass}>{content}</a>
    }

    return (
        <button type={type} onClick={onClick} className={finalClass} disabled={disabled}>
            {content}
        </button>
    )
}

export function ActionMenu({ actions, triggerIcon = 'more_vert', id }) {
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleMenu = (e) => {
        e.stopPropagation()
        setIsOpen(!isOpen)
    }

    return (
        <div className="bo-action-menu-container" ref={menuRef} id={id}>
            <button
                type="button"
                className={`bo-icon-btn bo-menu-trigger ${isOpen ? 'active' : ''}`}
                onClick={toggleMenu}
            >
                <span className="material-symbols-outlined">{triggerIcon}</span>
            </button>
            {isOpen && (
                <div className="bo-action-menu" style={{ display: 'block' }}>
                    {actions.map((action, idx) => (
                        action.href ? (
                            <a key={idx} href={action.href} className={`bo-menu-item ${action.danger ? 'danger' : ''}`}>
                                <span className="material-symbols-outlined">{action.icon}</span>
                                {action.label}
                            </a>
                        ) : (
                            <button key={idx} onClick={() => { action.onClick(); setIsOpen(false); }} className={`bo-menu-item ${action.danger ? 'danger' : ''}`}>
                                <span className="material-symbols-outlined">{action.icon}</span>
                                {action.label}
                            </button>
                        )
                    ))}
                </div>
            )}
        </div>
    )
}

export function StatCard({ label, value, subtext, color }) {
    return (
        <div className="bo-stat-card">
            <span className="bo-stat-label">{label}</span>
            <span className="bo-stat-value" style={color ? { color } : {}}>{value}</span>
            {subtext && <span className="bo-stat-subtext">{subtext}</span>}
        </div>
    )
}

export function DetailBlock({ label, icon, children, className = "" }) {
    return (
        <div className={`bo-info-block ${className}`}>
            <h4>
                {icon && <span className="material-symbols-outlined">{icon}</span>}
                {label}
            </h4>
            <div className="bo-info-content">
                {children}
            </div>
        </div>
    )
}

export function LinkRow({ label, url, icon }) {
    if (!url) return (
        <div className="bo-link-item empty">
            <span className="material-symbols-outlined">{icon}</span>
            <span className="bo-link-label">{label}: Vacío</span>
        </div>
    )
    return (
        <a href={url} target="_blank" className="bo-link-item">
            <span className="material-symbols-outlined">{icon}</span>
            <strong className="bo-link-label">{label}</strong>
            <span className="url-text">{url}</span>
            <span className="material-symbols-outlined open-icon">open_in_new</span>
        </a>
    )
}

// --- TOAST SYSTEM ---

export function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 4000)
        return () => clearTimeout(timer)
    }, [onClose])

    return (
        <div className={`bo-toast bo-toast-${type}`}>
            <span className="material-symbols-outlined">
                {type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info'}
            </span>
            <span className="bo-toast-message">{message}</span>
            <button onClick={onClose} className="bo-toast-close">×</button>
        </div>
    )
}

export function useToasts() {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = 'success') => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])
    }

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    const ToastContainer = () => (
        <div className="bo-toast-container">
            {toasts.map(t => (
                <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
            ))}
        </div>
    )

    return { addToast, ToastContainer }
}
