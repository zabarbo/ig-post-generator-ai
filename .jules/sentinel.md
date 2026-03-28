# Sentinel Journal 🛡️

## 2025-05-22 - [HIGH] Missing Authentication on AI Generation Endpoint
**Vulnerability:** The `/api/generate` endpoint was publicly accessible, allowing anyone to trigger expensive Gemini AI API calls without a valid session.
**Learning:** While the frontend was protected by redirects and middleware, the API route itself lacked an independent authentication check, making it vulnerable to direct exploitation via tools like `curl` or Postman.
**Prevention:** Always verify the user's session using `supabase.auth.getUser()` at the beginning of sensitive API routes, even if the frontend seems protected. Return a `401 Unauthorized` response if no valid session is found to protect backend resources and API quotas.
