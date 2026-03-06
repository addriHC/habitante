import { createClient } from '@/utils/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StatusPill, ActionButton, StatCard, DetailBlock, LinkRow } from '@/app/backoffice/components/ui/Atoms'

export default async function PromotionDetailPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/backoffice/login')

    // Fetch promotion with editor email if user_id is linked to auth.users (simplified here)
    const { data: promotion } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single()

    if (!promotion) notFound()

    return (
        <main className="bo-shell">
            <section className="bo-card bo-card-wide">
                <header className="bo-app-bar">
                    <div className="bo-app-bar-left">
                        <a href="/backoffice/promociones" className="bo-back-btn">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <p className="bo-kicker bo-pc-only">
                                {promotion.project_type === 'promocion' ? 'INVERSIÓN ACTIVA' : 'FASE DE ANÁLISIS'}
                            </p>
                            <h1 className="bo-h1">{promotion.name}</h1>
                        </div>
                    </div>
                    <div className="bo-app-bar-actions">
                        <div className="bo-pc-only">
                            <ActionButton label="Editar" href={`/backoffice/promociones/editar/${promotion.id}`} icon="edit" />
                        </div>
                    </div>
                </header>

                <div className="bo-detail-grid">
                    {/* LEFT COLUMN: Visuals & Core Status */}
                    <div className="bo-detail-column">
                        <img src={promotion.main_image_url || 'https://via.placeholder.com/400x250'} alt="" className="bo-preview-image" />

                        <div className="bo-status-row-simple">
                            <StatusPill status={promotion.status} />
                            <span className="bo-status-pill tag">
                                {promotion.category?.toUpperCase() || 'RESIDENCIAL'}
                            </span>
                        </div>

                        <DetailBlock label="Descripción" icon="notes">
                            <p className="bo-description-text">
                                {promotion.description || 'Sin descripción redactada.'}
                            </p>
                        </DetailBlock>

                        <DetailBlock label="Galería Multimedia" icon="collections">
                            <div className="bo-gallery-grid">
                                {(promotion.gallery_images || []).map((img, idx) => (
                                    <div key={idx} className="bo-gallery-item">
                                        <img src={img} alt="" />
                                    </div>
                                ))}
                                {(!promotion.gallery_images || promotion.gallery_images.length === 0) && (
                                    <p className="bo-text-muted small">Sin imágenes en la galería.</p>
                                )}
                            </div>
                        </DetailBlock>
                    </div>

                    {/* RIGHT COLUMN: Data & Financials */}
                    <div className="bo-detail-column">
                        <DetailBlock label="Datos Financieros" icon="payments">
                            <div className="bo-stats-row">
                                <StatCard
                                    label="Rentabilidad"
                                    value={`${promotion.profitability || '0'}%`}
                                    subtext={promotion.profitability_type === 'anual' ? 'ANUALIZADA' : 'TOTAL'}
                                />
                                <StatCard
                                    label="Meta Fondo"
                                    value={`${(promotion.target_funding / 1000000).toFixed(2)}M €`}
                                />
                                <StatCard
                                    label="Inversión Mín."
                                    value={`${promotion.min_investment || '0'} €`}
                                />
                                <StatCard
                                    label="Estado Operativo"
                                    value={promotion.investment_status || (promotion.project_type === 'estudio' ? 'En Estudio' : 'Activo')}
                                />
                            </div>
                        </DetailBlock>

                        <div className="bo-grid-2">
                            <DetailBlock label="Cronología" icon="schedule">
                                <StatCard
                                    label="Plazo Estimado"
                                    value={promotion.duration_months ? `${promotion.duration_months} Meses` : '—'}
                                />
                            </DetailBlock>
                            <DetailBlock label="Ejecución" icon="construction">
                                <StatCard
                                    label="Progreso Real"
                                    value={`${promotion.progress_percentage || '0'}%`}
                                />
                            </DetailBlock>
                        </div>

                        <DetailBlock label="Ubicación" icon="location_on">
                            <div className="bo-data-value">
                                {promotion.location}
                            </div>
                        </DetailBlock>

                        <DetailBlock label="Documentación y Enlaces" icon="folder_open">
                            <div className="bo-links-list">
                                <LinkRow label="Mapa (KML)" url={promotion.kml_url} icon="map" />
                                <LinkRow label="Memoria PDF" url={promotion.pdf_url} icon="picture_as_pdf" />
                                <LinkRow label="Vídeo YouTube" url={promotion.youtube_url} icon="play_circle" />
                                <LinkRow label="Google Drive 1" url={promotion.drive_link_1} icon="folder_shared" />
                                <LinkRow label="Google Drive 2" url={promotion.drive_link_2} icon="folder_shared" />
                            </div>
                        </DetailBlock>

                        <div className="bo-metadata-block">
                            <p className="bo-metadata-label">Metadata</p>
                            <p>ID: {promotion.id}</p>
                            <p>Actualizado: {new Date(promotion.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mobile Edit FAB */}
            <div className="bo-mobile-only">
                <ActionButton
                    label="Editar"
                    href={`/backoffice/promociones/editar/${promotion.id}`}
                    icon="edit"
                    className="bo-fab-mobile"
                />
            </div>
        </main>
    )
}
