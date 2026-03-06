// @ts-nocheck
import { serve } from "https://deno.land/std@0.224.0/http/server.ts"

type Json = Record<string, unknown>

const CORS_HEADERS_BASE = {
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-relay-token",
}

function parseJsonEnv<T>(raw: string | undefined, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function getAllowedOrigin(origin: string | null): string {
  const allowedOriginsRaw = Deno.env.get("ALLOWED_ORIGINS")
  const allowedOrigins = (allowedOriginsRaw || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)

  if (allowedOrigins.length === 0) {
    return "*"
  }

  if (origin && allowedOrigins.includes(origin)) {
    return origin
  }

  return ""
}

function corsHeaders(origin: string | null) {
  const allowedOrigin = getAllowedOrigin(origin)
  return {
    ...CORS_HEADERS_BASE,
    "Access-Control-Allow-Origin": allowedOrigin || "null",
    Vary: "Origin",
  }
}

function jsonResponse(status: number, body: Json, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin),
    },
  })
}

serve(async (req) => {
  const origin = req.headers.get("origin")

  if (req.method === "OPTIONS") {
    return new Response("ok", {
      status: 200,
      headers: corsHeaders(origin),
    })
  }

  const allowedOrigin = getAllowedOrigin(origin)
  if (allowedOrigin === "") {
    return jsonResponse(403, { error: "Origin not allowed" }, origin)
  }

  const requireToken = (Deno.env.get("RELAY_REQUIRE_TOKEN") || "false").toLowerCase() === "true"
  const relayToken = Deno.env.get("RELAY_TOKEN") || ""
  if (requireToken) {
    const incomingToken = req.headers.get("x-relay-token") || ""
    if (!relayToken || incomingToken !== relayToken) {
      return jsonResponse(401, { error: "Invalid relay token" }, origin)
    }
  }

  if (!["POST", "GET"].includes(req.method)) {
    return jsonResponse(405, { error: "Method not allowed" }, origin)
  }

  const targets = parseJsonEnv<Record<string, string>>(Deno.env.get("WEBHOOK_TARGETS_JSON"), {})
  const targetHeaders = parseJsonEnv<Record<string, Record<string, string>>>(
    Deno.env.get("WEBHOOK_TARGET_HEADERS_JSON"),
    {},
  )

  let body: Json
  try {
    body = (await req.json()) as Json
  } catch {
    return jsonResponse(400, { error: "Invalid JSON body" }, origin)
  }

  const targetKey = String(body.target || "").trim()
  if (!targetKey) {
    return jsonResponse(400, { error: "Missing target" }, origin)
  }

  const targetUrl = targets[targetKey]
  if (!targetUrl) {
    return jsonResponse(404, { error: "Unknown target" }, origin)
  }

  const method = String(body.method || "POST").toUpperCase()
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return jsonResponse(400, { error: "Invalid method" }, origin)
  }

  const payload = (body.payload ?? {}) as unknown
  const query = (body.query ?? {}) as Record<string, string | number | boolean>
  const customHeaders = (body.headers ?? {}) as Record<string, string>

  const url = new URL(targetUrl)
  Object.entries(query).forEach(([key, value]) => {
    url.searchParams.set(key, String(value))
  })

  const forwardHeaders: Record<string, string> = {
    ...(targetHeaders[targetKey] || {}),
    ...(customHeaders || {}),
  }

  if (!forwardHeaders["Content-Type"] && method !== "GET") {
    forwardHeaders["Content-Type"] = "application/json"
  }

  const timeoutMs = Number(body.timeoutMs || 15000)
  const abortSignal = AbortSignal.timeout(Number.isFinite(timeoutMs) ? timeoutMs : 15000)

  try {
    const forwardResponse = await fetch(url.toString(), {
      method,
      headers: forwardHeaders,
      body: method === "GET" ? undefined : JSON.stringify(payload),
      signal: abortSignal,
    })

    const responseText = await forwardResponse.text()
    let responseBody: unknown = responseText
    try {
      responseBody = JSON.parse(responseText)
    } catch {
      responseBody = responseText
    }

    return jsonResponse(
      forwardResponse.ok ? 200 : 502,
      {
        ok: forwardResponse.ok,
        target: targetKey,
        status: forwardResponse.status,
        response: responseBody,
      },
      origin,
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Relay request failed"
    return jsonResponse(500, { ok: false, error: message }, origin)
  }
})
