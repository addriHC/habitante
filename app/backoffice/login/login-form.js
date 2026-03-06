'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { FormField, ActionButton, useToasts } from '../components/ui/Atoms'

export default function LoginForm() {
    const router = useRouter()
    const { addToast, ToastContainer } = useToasts()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(event) {
        event.preventDefault()
        setLoading(true)

        const formData = new FormData(event.currentTarget)
        const email = formData.get('email')
        const password = formData.get('password')

        const supabase = createClient()

        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (loginError) {
            addToast('Error de acceso: ' + loginError.message, 'error')
            setLoading(false)
            return
        }

        addToast('Acceso concedido. Redirigiendo...', 'success')

        // Redirect to backoffice panel - the layout bouncer will handle the metadata check
        setTimeout(() => {
            router.refresh()
            router.push('/backoffice')
        }, 1000)
    }

    return (
        <form onSubmit={handleSubmit} className="bo-form">
            <ToastContainer />

            <FormField
                label="Email"
                name="email"
                type="email"
                placeholder="tu@email.com"
                icon="mail"
                required
            />

            <FormField
                label="Contraseña"
                name="password"
                type="password"
                placeholder="••••••••"
                icon="lock"
                required
            />

            <ActionButton
                type="submit"
                label={loading ? 'Iniciando sesión...' : 'Entrar en plataforma'}
                disabled={loading}
                className="bo-btn-active bo-mt-12"
            />

            <div className="bo-text-center bo-mt-16">
                <a href="/" style={{ fontSize: '0.8rem', opacity: 0.6, textDecoration: 'underline' }}>
                    Volver al sitio público
                </a>
            </div>
        </form>
    )
}
