import { createClient } from '@/utils/supabase/server'
import PromotionForm from '@/app/backoffice/components/PromotionForm'
import { redirect, notFound } from 'next/navigation'

export default async function EditPromotionPage({ params }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/backoffice/login')

    const { data: promotion } = await supabase
        .from('promotions')
        .select('*')
        .eq('id', id)
        .single()

    if (!promotion) notFound()

    return (
        <main className="bo-shell">
            <section className="bo-card bo-card-wide">
                <header className="bo-app-bar bo-no-border">
                    <div className="bo-app-bar-left">
                        <a href={`/backoffice/promociones/detalle/${promotion.id}`} className="bo-back-btn">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <p className="bo-kicker bo-pc-only">Editar Contenido</p>
                            <h1 className="bo-h1">Editar Promoción</h1>
                        </div>
                    </div>
                </header>
                <div className="bo-pc-only bo-px-20">
                    <p className="bo-subtext">Actualizando {promotion.name}</p>
                </div>

                <PromotionForm initialData={promotion} isEditing={true} />
            </section>
        </main>
    )
}
