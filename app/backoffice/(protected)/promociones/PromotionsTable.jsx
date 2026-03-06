'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { StatusPill, ActionButton, ActionMenu, useToasts } from '@/app/backoffice/components/ui/Atoms'

export default function PromotionsTable({ initialData }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const { addToast, ToastContainer } = useToasts()
    const logoutFormRef = useRef(null)
    const searchInputRef = useRef(null)

    const [promotions, setPromotions] = useState(initialData)
    const [filteredPromotions, setFilteredPromotions] = useState(initialData)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [deleteId, setDeleteId] = useState(null)

    useEffect(() => {
        let result = promotions
        if (search) {
            const term = search.toLowerCase()
            result = result.filter(p =>
                (p.name && p.name.toLowerCase().includes(term)) ||
                (p.location && p.location.toLowerCase().includes(term))
            )
        }
        if (statusFilter !== 'all') {
            result = result.filter(p => p.status === statusFilter)
        }
        setFilteredPromotions(result || [])
    }, [search, statusFilter, promotions])

    async function confirmDelete() {
        if (!deleteId) return

        // Dynamic import to avoid server-side issues with supabase client in this specific helper
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()

        const { error } = await supabase.from('promotions').delete().eq('id', deleteId)
        if (error) {
            addToast('No se pudo eliminar: ' + error.message, 'error')
        } else {
            addToast('Ítem eliminado con éxito', 'success')
            setPromotions(promotions.filter(p => p.id !== deleteId))
        }
        setDeleteId(null)
    }

    const getRowActions = (item) => [
        { label: 'Ver Detalles', icon: 'visibility', href: `/backoffice/promociones/detalle/${item.id}` },
        { label: 'Editar', icon: 'edit', href: `/backoffice/promociones/editar/${item.id}` },
        { label: 'Eliminar', icon: 'delete', danger: true, onClick: () => setDeleteId(item.id) },
    ]

    const globalActions = [
        { label: 'Volver a la web', icon: 'language', href: '/' },
        { label: 'Cerrar sesión', icon: 'logout', danger: true, onClick: () => logoutFormRef.current?.requestSubmit() },
    ]

    const filterActions = [
        { label: 'Todos', icon: 'list', onClick: () => setStatusFilter('all') },
        { label: 'Publicados', icon: 'check_circle', onClick: () => setStatusFilter('published') },
        { label: 'Borradores', icon: 'edit_note', onClick: () => setStatusFilter('draft') },
        { label: 'Archivados', icon: 'archive', onClick: () => setStatusFilter('archived') },
    ]

    const handleSearchClick = () => {
        setIsSearchFocused(true)
        setTimeout(() => searchInputRef.current?.focus(), 50)
    }

    return (
        <section className="bo-card bo-card-wide">
            <ToastContainer />
            <form action="/auth/signout" method="post" ref={logoutFormRef} style={{ display: 'none' }} />

            {/* Delete Confirmation */}
            {deleteId && (
                <div className="bo-modal-overlay" onClick={() => setDeleteId(null)}>
                    <div className="bo-preview-modal bo-text-center" onClick={e => e.stopPropagation()} style={{ padding: '32px' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: '#ef4444', marginBottom: '16px' }}>warning</span>
                        <h3 className="text-xl font-bold mb-2">¿Confirmar Eliminación?</h3>
                        <p className="text-slate-400 text-sm mb-8">Esta acción eliminará permanentemente el proyecto y sus archivos asociados.</p>
                        <div className="flex gap-4">
                            <ActionButton label="Cancelar" variant="ghost" className="bo-flex-1" onClick={() => setDeleteId(null)} />
                            <ActionButton label="Eliminar" className="bo-flex-1" style={{ background: '#ef4444', color: 'white' }} onClick={confirmDelete} />
                        </div>
                    </div>
                </div>
            )}

            <header className={`bo-app-bar ${isSearchFocused ? 'bo-search-active' : ''}`}>
                <div className="bo-app-bar-menu">
                    <ActionMenu actions={globalActions} triggerIcon="menu" id="bo-main-menu" />
                </div>

                {!isSearchFocused && (
                    <div className="bo-app-bar-left">
                        <div className="bo-title-group">
                            <p className="bo-kicker bo-pc-only">Gestión Habitante</p>
                            <h1 className="bo-h1">Inventario</h1>
                        </div>
                    </div>
                )}

                <div className="bo-app-bar-actions">
                    {/* Mobile Search */}
                    <div className="bo-mobile-only">
                        {isSearchFocused ? (
                            <div className="bo-search-header-active">
                                <div className="bo-search-input">
                                    <span className="material-symbols-outlined">search</span>
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        placeholder="Buscar..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onBlur={() => { if (!search) setIsSearchFocused(false) }}
                                    />
                                </div>
                                <button className="bo-icon-btn bo-search-close-btn" onClick={() => { setSearch(''); setIsSearchFocused(false); }}>
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                        ) : (
                            <button className="bo-icon-btn bo-search-trigger" onClick={handleSearchClick}>
                                <span className="material-symbols-outlined">search</span>
                            </button>
                        )}
                    </div>

                    {/* Desktop Search */}
                    <div className="bo-pc-only">
                        <div className="bo-search-input">
                            <span className="material-symbols-outlined">search</span>
                            <input
                                type="text"
                                placeholder="Filtrar por nombre o ciudad..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="bo-app-bar-filter-group">
                        <select className="bo-select-filter bo-pc-only" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Todos los estados</option>
                            <option value="published">Publicados</option>
                            <option value="draft">Borradores</option>
                            <option value="archived">Archivados</option>
                        </select>
                        <div className="bo-mobile-only">
                            <ActionMenu actions={filterActions} triggerIcon="filter_list" id="bo-filter-menu" />
                        </div>
                    </div>

                    <div className="bo-pc-only">
                        <ActionButton label="Añadir" href="/backoffice/promociones/nueva" icon="add" />
                    </div>
                </div>
            </header>

            <div className="bo-table-container">
                <table className="bo-table">
                    <thead>
                        <tr>
                            <th>Proyecto</th>
                            <th>Ubicación</th>
                            <th>Estado</th>
                            <th>Orden</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPromotions.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="bo-text-center" style={{ padding: '60px', color: '#64748b' }}>
                                    No se han encontrado resultados.
                                </td>
                            </tr>
                        ) : (
                            filteredPromotions.map((item) => (
                                <tr key={item.id} className="bo-table-row">
                                    <td>
                                        <div className="bo-name-cell">
                                            <div className="bo-thumb-container">
                                                {item.main_image_url ? (
                                                    <img src={item.main_image_url} alt="" className="bo-thumb" />
                                                ) : (
                                                    <div className="bo-thumb bo-thumb-empty"><span className="material-symbols-outlined">image_not_supported</span></div>
                                                )}
                                            </div>
                                            <div>
                                                <strong className="bo-name-text">{item.name}</strong>
                                                <div className="bo-text-muted" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                    {item.project_type === 'estudio' ? 'Análisis' : 'Propiedad'} • {item.category}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{item.location}</td>
                                    <td><StatusPill status={item.status} /></td>
                                    <td>
                                        <span style={{
                                            display: 'inline-block',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            background: 'rgba(118, 228, 116, 0.1)',
                                            color: 'var(--primary)',
                                            fontSize: '0.8rem',
                                            fontWeight: 800
                                        }}>
                                            #{item.priority}
                                        </span>
                                    </td>
                                    <td>
                                        <ActionMenu actions={getRowActions(item)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="bo-mobile-list">
                {filteredPromotions.length === 0 ? (
                    <p className="bo-text-center" style={{ padding: '40px', color: '#64748b' }}>No hay resultados.</p>
                ) : (
                    filteredPromotions.map((item) => (
                        <div key={item.id} className="bo-mobile-card">
                            <div className="bo-mobile-card-top">
                                <div className="bo-thumb-container">
                                    {item.main_image_url ? (
                                        <img src={item.main_image_url} alt="" className="bo-thumb" />
                                    ) : (
                                        <div className="bo-thumb bo-thumb-empty"><span className="material-symbols-outlined">image</span></div>
                                    )}
                                </div>
                                <div className="bo-mobile-card-info">
                                    <strong className="bo-mobile-card-name" style={{ lineHeight: 1.2 }}>{item.name}</strong>
                                    <span className="bo-mobile-card-loc" style={{ fontSize: '0.75rem' }}>{item.location}</span>
                                </div>
                                <ActionMenu actions={getRowActions(item)} />
                            </div>
                            <div className="bo-mobile-card-meta">
                                <div className="flex gap-2">
                                    <StatusPill status={item.status} />
                                    <span className="bo-status-pill" style={{ opacity: 0.5, border: 'none', background: 'transparent', fontSize: '0.6rem' }}>
                                        {item.project_type.toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '800' }}>#{item.priority}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="bo-mobile-only">
                <ActionButton
                    label="Nueva"
                    href="/backoffice/promociones/nueva"
                    icon="add"
                    variant="primary"
                    className="bo-fab-mobile"
                />
            </div>
        </section>
    )
}
