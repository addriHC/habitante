import PromotionForm from '@/app/plataforma/components/PromotionForm'

export default function NewPromotionPage() {
    return (
        <main className="bo-shell">
            <section className="bo-card bo-card-wide">
                <header className="bo-app-bar bo-no-border">
                    <div className="bo-app-bar-left">
                        <a href="/plataforma/promociones" className="bo-back-btn">
                            <span className="material-symbols-outlined">arrow_back</span>
                        </a>
                        <div>
                            <p className="bo-kicker bo-pc-only">Crear Contenido</p>
                            <h1 className="bo-h1">Nueva Promoción</h1>
                        </div>
                    </div>
                </header>
                <div className="bo-pc-only bo-px-20">
                    <p className="bo-subtext">Completa los detalles para crear una nueva oferta de propiedad.</p>
                </div>

                <PromotionForm />
            </section>
        </main>
    )
}
