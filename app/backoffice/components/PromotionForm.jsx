'use client'

import { useState, Fragment, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { FormField, FormSection, ActionButton, useToasts } from './ui/Atoms'

const STATUS_OPTIONS = [
    { value: 'draft', label: 'Borrador' },
    { value: 'published', label: 'Publicado' },
    { value: 'archived', label: 'Archivado' }
]

const STEPS = [
    { id: 'general', label: 'General', icon: 'info' },
    { id: 'finances', label: 'Finanzas y Detalles', icon: 'euro' },
    { id: 'media', label: 'Multimedia', icon: 'image' },
    { id: 'links', label: 'Documentos', icon: 'link' },
    { id: 'review', label: 'Resumen', icon: 'visibility' }
]

export default function PromotionForm({ initialData = null, isEditing = false }) {
    const router = useRouter()
    const supabase = createClient()
    const { addToast, ToastContainer } = useToasts()
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState(initialData?.main_image_url || null)

    // Gallery Management
    const [existingGallery, setExistingGallery] = useState(initialData?.gallery_images || [])
    const [newGalleryFiles, setNewGalleryFiles] = useState([])
    const [newGalleryPreviews, setNewGalleryPreviews] = useState([])

    const [showPreview, setShowPreview] = useState(false)
    const [currentStep, setCurrentStep] = useState(0)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        location: initialData?.location || '',
        project_type: initialData?.project_type || 'promocion',
        status: initialData?.status || 'draft',
        priority: initialData?.priority || 0,
        pdf_url: initialData?.pdf_url || '',
        youtube_url: initialData?.youtube_url || '',
        drive_link_1: initialData?.drive_link_1 || '',
        drive_link_2: initialData?.drive_link_2 || '',
        profitability: initialData?.profitability || '',
        min_investment: initialData?.min_investment || '',
        pem: initialData?.pem || '',
        duration_months: initialData?.duration_months || '',
        area_m2: initialData?.area_m2 || '',
        investment_status: initialData?.investment_status || 'En Financiación',
        category: initialData?.category || 'residencial',
        target_funding: initialData?.target_funding || '',
        profitability_type: initialData?.profitability_type || 'total',
        description: initialData?.description || '',
        metadata: initialData?.metadata || { is_initiative: false },
    })

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        const val = type === 'checkbox' ? checked : value

        setFormData(prev => {
            const next = { ...prev, [name]: val }
            if (name === 'project_type') {
                if (val === 'estudio') next.investment_status = 'En Estudio'
                if (val === 'promocion' && (prev.investment_status === 'En Estudio')) next.investment_status = 'En Financiación'
            }
            return next
        })
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
    }

    const handleMetadataChange = (key, value) => {
        setFormData(prev => ({
            ...prev,
            metadata: {
                ...prev.metadata,
                [key]: value
            }
        }))
    }

    const removeExistingImage = (idx) => {
        setExistingGallery(prev => prev.filter((_, i) => i !== idx))
        addToast('Imagen eliminada de la galería', 'info')
    }

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files)
        if (files.length > 0) {
            setNewGalleryFiles(prev => [...prev, ...files])
            setNewGalleryPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
            addToast(`${files.length} imágenes añadidas a la cola`, 'success')
        }
    }

    const removeNewImage = (idx) => {
        setNewGalleryFiles(prev => prev.filter((_, i) => i !== idx))
        setNewGalleryPreviews(prev => prev.filter((_, i) => i !== idx))
    }

    const validateForm = (raw, files) => {
        if (!formData.name.trim()) return 'El nombre de la promoción es obligatorio'
        if (!formData.location.trim()) return 'La ubicación es obligatoria'
        if (!formData.target_funding) return 'La meta de financiación es obligatoria'

        const urlFields = ['pdf_url', 'youtube_url', 'drive_link_1', 'drive_link_2']
        for (const field of urlFields) {
            const val = formData[field]
            if (val && !val.startsWith('http')) return `La URL de ${field.replace('_', ' ')} no es válida`
        }

        return null
    }

    async function handleSubmit(event) {
        event.preventDefault()
        const formEl = event.currentTarget
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuario no autenticado')

            const errorMsg = validateForm()
            if (errorMsg) {
                addToast(errorMsg, 'error')
                setLoading(false)
                return
            }

            let main_image_url = initialData?.main_image_url || ''
            let kml_url = initialData?.kml_url || ''

            // Upload Cover
            const coverFileInput = formEl?.main_image
            if (coverFileInput?.files[0]) {
                const file = coverFileInput.files[0]
                const path = `cover-${Date.now()}.${file.name.split('.').pop()}`
                const { error } = await supabase.storage.from('promotions_media').upload(path, file)
                if (error) throw error
                main_image_url = supabase.storage.from('promotions_media').getPublicUrl(path).data.publicUrl
            }

            // Upload KML
            const kmlFileInput = formEl?.kml_file
            if (kmlFileInput?.files[0]) {
                const file = kmlFileInput.files[0]
                const path = `kml-${Date.now()}.kml`
                const { error } = await supabase.storage.from('promotions_media').upload(path, file)
                if (error) throw error
                kml_url = supabase.storage.from('promotions_media').getPublicUrl(path).data.publicUrl
            }

            // Upload New Gallery Images
            let updatedGallery = [...existingGallery]
            for (const file of newGalleryFiles) {
                const path = `gallery-${Date.now()}-${Math.floor(Math.random() * 1000)}.${file.name.split('.').pop()}`
                const { error } = await supabase.storage.from('promotions_media').upload(path, file)
                if (error) throw error
                updatedGallery.push(supabase.storage.from('promotions_media').getPublicUrl(path).data.publicUrl)
            }

            const payload = {
                ...formData,
                profitability: formData.profitability ? parseFloat(formData.profitability) : 0,
                min_investment: formData.min_investment ? parseFloat(formData.min_investment) : 0,
                pem: formData.pem ? parseFloat(formData.pem) : 0,
                target_funding: formData.target_funding ? parseFloat(formData.target_funding) : 0,
                duration_months: formData.duration_months ? parseInt(formData.duration_months) : 0,
                area_m2: formData.area_m2 ? parseFloat(formData.area_m2) : 0,
                progress_percentage: formData.progress_percentage ? parseInt(formData.progress_percentage) : 0,
                priority: formData.priority ? parseInt(formData.priority) : 0,
                main_image_url,
                kml_url,
                gallery_images: updatedGallery,
                updated_at: new Date().toISOString()
            }

            if (isEditing) {
                const { error } = await supabase.from('promotions').update(payload).eq('id', initialData.id)
                if (error) throw error
                addToast('Promoción actualizada correctamente', 'success')
            } else {
                const { error } = await supabase.from('promotions').insert([{ ...payload, user_id: user.id }])
                if (error) throw error
                addToast('Promoción creada y publicada', 'success')
            }

            setTimeout(() => {
                router.push('/backoffice/promociones')
                router.refresh()
            }, 1000)

        } catch (error) {
            addToast('Error: ' + error.message, 'error')
        } finally {
            setLoading(false)
        }
    }

    const nextStep = () => {
        const newErrors = {}
        if (currentStep === 0) {
            if (!formData.name.trim()) newErrors.name = 'El nombre es obligatorio'
            if (!formData.location.trim()) newErrors.location = 'La ubicación es obligatoria'
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors)
            addToast('Revisa los campos obligatorios', 'error')
            return
        }
        setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

    return (
        <form className="bo-form" onSubmit={handleSubmit} noValidate>
            <ToastContainer />

            {/* Stepper */}
            <div className="bo-stepper">
                {STEPS.map((step, index) => (
                    <Fragment key={step.id}>
                        <div className={`bo-step ${index < currentStep ? 'completed' : ''} ${index === currentStep ? 'active' : ''}`}>
                            <div className="bo-step-circle">
                                {index < currentStep ? <span className="material-symbols-outlined">check</span> : index + 1}
                            </div>
                            <span className="bo-step-label">{step.label}</span>
                        </div>
                        {index < STEPS.length - 1 && <div className={`bo-step-line ${index < currentStep ? 'completed' : ''}`} />}
                    </Fragment>
                ))}
            </div>

            <div className="bo-step-content">
                {/* Step 0: General */}
                <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
                    <FormSection title="Información General">
                        <div className="bo-grid-2">
                            <FormField label="Nombre *" name="name" value={formData.name} onChange={handleInputChange} icon="badge" error={errors.name} />
                            <FormField label="Ubicación *" name="location" value={formData.location} onChange={handleInputChange} icon="location_on" error={errors.location} />
                        </div>
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Modalidad" icon="account_balance">
                                <select name="project_type" className="bo-select" value={formData.project_type} onChange={handleInputChange}>
                                    <option value="promocion">Inversión Activa</option>
                                    <option value="estudio">Fase de Análisis</option>
                                </select>
                            </FormField>
                            <FormField label="Visibilidad" icon="visibility">
                                <select name="status" className="bo-select" value={formData.status} onChange={handleInputChange}>
                                    {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </FormField>
                        </div>
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Categoría" icon="layers">
                                <select name="category" className="bo-select" value={formData.category} onChange={handleInputChange}>
                                    <option value="residencial">Residencial</option>
                                    <option value="comercial">Comercial</option>
                                    <option value="suelo">Suelo</option>
                                </select>
                            </FormField>
                            <FormField label="Prioridad" name="priority" type="number" icon="low_priority" value={formData.priority} onChange={handleInputChange} />
                        </div>
                        <div className="bo-grid-2">
                            <FormField label="Destacar como Iniciativa" icon="star">
                                <div style={{ display: 'flex', alignItems: 'center', height: '48px', padding: '0 18px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={formData.metadata?.is_initiative || false} 
                                        onChange={(e) => handleMetadataChange('is_initiative', e.target.checked)}
                                        style={{ width: '20px', height: '20px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                                    />
                                    <span style={{ marginLeft: '12px', color: '#f8fafc', fontSize: '0.9rem' }}>
                                        Mostrar en la sección "Iniciativas"
                                    </span>
                                </div>
                            </FormField>
                        </div>
                    </FormSection>
                </div>

                {/* Step 1: Finances */}
                <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
                    <FormSection title="Finanzas y Detalles">
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Rentabilidad (%)" name="profitability" type="number" step="0.01" value={formData.profitability} onChange={handleInputChange} icon="percent" />
                            <FormField label="Tipo Rent." icon="timeline">
                                <select name="profitability_type" className="bo-select" value={formData.profitability_type} onChange={handleInputChange}>
                                    <option value="total">Total</option>
                                    <option value="anual">Anual</option>
                                </select>
                            </FormField>
                        </div>
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Meta Fondo (€) *" name="target_funding" type="number" value={formData.target_funding} onChange={handleInputChange} icon="payments" />
                            <FormField label="PEM (€)" name="pem" type="number" value={formData.pem} onChange={handleInputChange} icon="account_balance_wallet" />
                        </div>
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Inv. Mínima (€)" name="min_investment" type="number" value={formData.min_investment} onChange={handleInputChange} icon="euro" />
                            <FormField label="Plazo (Meses)" name="duration_months" type="number" value={formData.duration_months} onChange={handleInputChange} icon="calendar_month" />
                        </div>
                        <div className="bo-grid-2 bo-grid-mobile-2">
                            <FormField label="Superficie (m2)" name="area_m2" type="number" step="0.01" value={formData.area_m2} onChange={handleInputChange} icon="straighten" />
                            <FormField label="Progreso (%)" name="progress_percentage" type="number" value={formData.progress_percentage} onChange={handleInputChange} icon="construction" />
                        </div>
                        <FormField label="Estado Operativo" icon="currency_exchange">
                            <select name="investment_status" className="bo-select" value={formData.investment_status} onChange={handleInputChange} disabled={formData.project_type === 'estudio'}>
                                {formData.project_type === 'estudio' ? (
                                    <option value="En Estudio">En Estudio</option>
                                ) : (
                                    <>
                                        <option value="En Financiación">En Financiación</option>
                                        <option value="En curso">En curso</option>
                                        <option value="Obras">Obras</option>
                                        <option value="Finalizado">Finalizado</option>
                                    </>
                                )}
                            </select>
                        </FormField>
                        <FormField label="Descripción" icon="description">
                            <textarea name="description" className="bo-input" rows="4" value={formData.description} onChange={handleInputChange} style={{ resize: 'none' }}></textarea>
                        </FormField>
                    </FormSection>
                </div>

                {/* Step 2: Media */}
                <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
                    <FormSection title="Multimedia">
                        <div className="bo-grid-2">
                            <FormField label="Portada" icon="image">
                                <input name="main_image" type="file" className="bo-input" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0]
                                    if (file) setImagePreview(URL.createObjectURL(file))
                                }} />
                            </FormField>
                            <FormField label="Mapa (KML)" icon="map">
                                <input name="kml_file" type="file" className="bo-input" accept=".kml" />
                            </FormField>
                        </div>

                        {imagePreview && (
                            <div className="bo-preview-media">
                                <img src={imagePreview} alt="Hero Preview" />
                            </div>
                        )}

                        <div className="bo-gallery-manager">
                            <FormField label="Añadir a Galería" icon="add_photo_alternate">
                                <input type="file" multiple className="bo-input" accept="image/*" onChange={handleGalleryChange} />
                            </FormField>

                            {(existingGallery.length > 0 || newGalleryPreviews.length > 0) && (
                                <div className="bo-gallery-list">
                                    {existingGallery.map((src, idx) => (
                                        <div key={`exist-${idx}`} className="bo-gallery-item">
                                            <img src={src} alt="" />
                                            <button type="button" onClick={() => removeExistingImage(idx)}>×</button>
                                        </div>
                                    ))}
                                    {newGalleryPreviews.map((src, idx) => (
                                        <div key={`new-${idx}`} className="bo-gallery-item new">
                                            <img src={src} alt="" />
                                            <button type="button" onClick={() => removeNewImage(idx)}>×</button>
                                            <span className="badge">NUEVA</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FormSection>
                </div>

                {/* Step 3: Links */}
                <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
                    <FormSection title="Documentación">
                        <div className="bo-grid-2">
                            <FormField label="PDF Dossier" name="pdf_url" value={formData.pdf_url} onChange={handleInputChange} icon="picture_as_pdf" placeholder="https://..." />
                            <FormField label="Vídeo YouTube" name="youtube_url" value={formData.youtube_url} onChange={handleInputChange} icon="play_circle" placeholder="https://..." />
                            <FormField label="Drive Link 1" name="drive_link_1" value={formData.drive_link_1} onChange={handleInputChange} icon="folder_shared" />
                            <FormField label="Drive Link 2" name="drive_link_2" value={formData.drive_link_2} onChange={handleInputChange} icon="folder_shared" />
                        </div>
                    </FormSection>
                </div>

                {/* Step 4: Review */}
                <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
                    <div className="bo-review-step">
                        <h2 className="bo-form-title">Verificación Final</h2>
                        <div className="bo-review-grid">
                            <div className="bo-review-card">
                                <img src={imagePreview || 'https://i.postimg.cc/MKncLryk/habitantelogo2.png'} alt="Preview" />
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-2">{formData.name || 'Sin Nombre'}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{formData.location || 'Sin Ubicación'}</p>
                                    <div className="flex gap-2">
                                        <span className={`bo-status-pill bo-status-${formData.status}`}>{formData.status}</span>
                                        <span className="bo-status-pill tag" style={{ background: 'rgba(118,228,116,0.1)', color: 'var(--primary)', border: 'none' }}>
                                            {formData.project_type === 'promocion' ? 'INVERSIÓN' : 'ANÁLISIS'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="bo-review-info">
                                <div className="bo-info-card">
                                    <strong>Rentabilidad</strong>
                                    <p>{formData.profitability || '0'}% ({formData.profitability_type})</p>
                                </div>
                                <div className="bo-info-card">
                                    <strong>Meta Fondo</strong>
                                    <p>{parseInt(formData.target_funding || 0).toLocaleString()} €</p>
                                </div>
                                <div className="bo-info-card">
                                    <strong>PEM</strong>
                                    <p>{parseInt(formData.pem || 0).toLocaleString()} €</p>
                                </div>
                                <div className="bo-info-card">
                                    <strong>Estado Operativo</strong>
                                    <p>{formData.investment_status}</p>
                                </div>
                                <div className="bo-info-card">
                                    <strong>Superficie</strong>
                                    <p>{formData.area_m2 || '0'} m2</p>
                                </div>
                                <div className="bo-info-card">
                                    <strong>Galería</strong>
                                    <p>{existingGallery.length + newGalleryFiles.length} imágenes</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bo-actions">
                {currentStep > 0 && <ActionButton label="Atrás" variant="ghost" icon="arrow_back" onClick={prevStep} disabled={loading} />}
                <div style={{ flex: 1 }} />
                <ActionButton label="Previsualizar" variant="ghost" icon="visibility" onClick={() => setShowPreview(true)} />
                {currentStep < STEPS.length - 1 ? (
                    <ActionButton label="Siguiente" icon="arrow_forward" onClick={nextStep} className="bo-btn-icon-right bo-btn-active" />
                ) : (
                    <ActionButton label={loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Publicar')} type="submit" icon={isEditing ? 'save' : 'publish'} disabled={loading} className="bo-btn-active" />
                )}
            </div>

            {/* Dynamic Preview Modal */}
            {showPreview && (
                <div className="bo-modal-overlay" onClick={() => setShowPreview(false)}>
                    <div className="bo-preview-modal" onClick={e => e.stopPropagation()}>
                        <button className="bo-modal-close" onClick={() => setShowPreview(false)}>×</button>
                        <div className="bo-preview-mock-hero">
                            <img src={imagePreview || 'https://i.postimg.cc/MKncLryk/habitantelogo2.png'} alt="" />
                            <div className="bo-preview-badge">{formData.status.toUpperCase()}</div>
                        </div>
                        <div className="p-8">
                            <p className="text-[var(--primary)] text-[10px] font-black tracking-widest uppercase mb-1">{formData.project_type === 'estudio' ? 'Fase de Análisis' : 'Inversión Activa'}</p>
                            <h3 className="text-2xl font-bold mb-1">{formData.name || 'Nombre del Proyecto'}</h3>
                            <p className="text-slate-400 text-sm mb-6">{formData.location || 'Localización'}</p>

                            <div className="flex justify-between items-end pt-6 border-t border-white/10">
                                <div>
                                    <span className="text-[var(--primary)] text-2xl font-bold">{formData.profitability || '0'}%</span>
                                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Rent. Est. ({formData.profitability_type})</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-white text-lg font-bold">{(formData.target_funding / 1000000).toFixed(2)}M€</span>
                                    <span className="block text-[10px] text-slate-500 font-bold uppercase">Objetivo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </form>
    )
}
