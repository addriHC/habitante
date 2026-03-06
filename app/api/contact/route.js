import { NextResponse } from 'next/server'

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function cleanString(value, max = 2000) {
    return String(value || '').trim().slice(0, max)
}

export async function POST(request) {
    try {
        const body = await request.json()

        const name = cleanString(body?.name, 120)
        const email = cleanString(body?.email, 200)
        const phone = cleanString(body?.phone, 50)
        const interest = cleanString(body?.interest, 100)
        const message = cleanString(body?.message, 3000)

        if (!name || !email || !interest || !message) {
            return NextResponse.json(
                { error: 'Faltan campos obligatorios.' },
                { status: 400 }
            )
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { error: 'El email no es válido.' },
                { status: 400 }
            )
        }

        const webhookUrl = process.env.N8N_CONTACT_WEBHOOK_URL

        if (!webhookUrl) {
            return NextResponse.json(
                {
                    error: 'Webhook n8n no configurado en servidor. Define N8N_CONTACT_WEBHOOK_URL.'
                },
                { status: 500 }
            )
        }

        const webhookPayload = {
            name,
            email,
            phone,
            interest,
            message,
            to_email: cleanString(body?.to_email, 200) || 'aiblueways@gmail.com',
            from_email: cleanString(body?.from_email, 200) || 'hello@blueways.es',
            source: cleanString(body?.source, 80) || 'contacto.html',
            submitted_at: cleanString(body?.submitted_at, 80) || new Date().toISOString()
        }

        const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        })

        const webhookResult = await webhookResponse.text()

        if (!webhookResponse.ok) {
            console.error('n8n webhook error:', webhookResult)
            return NextResponse.json(
                { error: 'El webhook n8n no pudo procesar la solicitud.' },
                { status: webhookResponse.status }
            )
        }

        return NextResponse.json({ ok: true, result: webhookResult || null })
    } catch (error) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            { error: 'Error interno al procesar la solicitud.' },
            { status: 500 }
        )
    }
}
