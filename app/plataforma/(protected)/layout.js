import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({ children }) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 1. Check if user is logged in
    if (!user) {
        redirect('/plataforma/login')
    }

    // 2. THE BOUNCER CHECK (Strict Mode)
    // We ONLY check app_metadata for security
    const appAccess = user.app_metadata?.client_portal_access || []
    const hasAccess = appAccess.includes('habitante')

    if (!hasAccess) {
        return (
            <main className="bo-shell">
                <section className="bo-card bo-text-center">
                    <h1 className="bo-h1" style={{ color: '#ef4444' }}>403 No Autorizado</h1>
                    <p className="bo-subtext">Tu cuenta no tiene permisos para acceder a la plataforma de Habitante.</p>
                    <div className="bo-actions bo-justify-center">
                        <form action="/auth/signout" method="post">
                            <button className="bo-btn" type="submit">Cerrar Sesión</button>
                        </form>
                    </div>
                </section>
            </main>
        )
    }

    return <>{children}</>
}
