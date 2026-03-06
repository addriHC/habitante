# webhook-relay (Supabase Edge Function)

Generic relay function to call external webhooks (including n8n) without exposing webhook URLs in the frontend.

## Request format

Send `POST` to your function URL with JSON:

```json
{
  "target": "contact_form",
  "method": "POST",
  "payload": {
    "name": "John",
    "email": "john@site.com"
  },
  "query": {
    "source": "website"
  },
  "headers": {
    "x-custom": "value"
  },
  "timeoutMs": 15000
}
```

- `target` (required): key to resolve destination URL from env mapping.
- `payload` (optional): JSON body to forward.
- `query` (optional): query params appended to target URL.
- `headers` (optional): extra headers forwarded to destination.
- `method` (optional): defaults to `POST`.

## Required Supabase secrets

Set these in Supabase project secrets:

- `WEBHOOK_TARGETS_JSON`
  - Example:
    ```json
    {"contact_form":"https://blueways.app.n8n.cloud/webhook/xxxx"}
    ```

## Optional secrets

- `WEBHOOK_TARGET_HEADERS_JSON`
  - Per-target static headers.
  - Example:
    ```json
    {"contact_form":{"x-api-key":"secret-value"}}
    ```

- `ALLOWED_ORIGINS`
  - Comma-separated origins for CORS.
  - Example:
    ```
    https://habitante-web.web.app,http://localhost:3000
    ```

- `RELAY_REQUIRE_TOKEN`
  - `true` or `false`.
- `RELAY_TOKEN`
  - Required only when `RELAY_REQUIRE_TOKEN=true`.
  - Client must send `x-relay-token` header.

## Deploy

```bash
supabase functions deploy webhook-relay
```

## Invoke (example)

```bash
curl -X POST "https://<PROJECT_REF>.functions.supabase.co/webhook-relay" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <SUPABASE_ANON_OR_SERVICE_ROLE_KEY>" \
  -d '{
    "target": "contact_form",
    "payload": {
      "name": "Test",
      "email": "test@example.com"
    }
  }'
```

## Notes

- Function returns `200` when relay target responds OK.
- Function returns `502` when relay target returns non-2xx.
- You can reuse this across multiple apps by adding more entries in `WEBHOOK_TARGETS_JSON`.
