import LoginForm from './login-form'
import '../admin.css'

export default function LoginPage() {
    return (
        <main className="bo-shell">
            <section className="bo-card">
                <img
                    src="https://i.postimg.cc/MKncLryk/habitantelogo2.png"
                    alt="Habitante"
                    className="bo-logo"
                />
                <p className="bo-kicker">Plataforma Habitante</p>
                <h1 className="bo-h1">Acceso Backoffice</h1>
                <p className="bo-subtext">Inicia sesión para gestionar inversores, operaciones y documentación.</p>

                <LoginForm />
            </section>
        </main>
    )
}
