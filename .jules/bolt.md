## 2025-05-14 - Optimized Supabase Data Fetching
**Learning:** Fetching all data and filtering on the client-side is a major performance bottleneck as the database grows. Composite indexes are crucial for optimizing queries that filter by multiple columns (e.g., user_id and status).
**Action:** Always use server-side filtering and limits when fetching lists. Add composite indexes for common query patterns.

## 2025-05-14 - Environment-Specific Gemini Models
**Learning:** Model names can be highly environment-specific. While "gemini-1.5-flash" is standard, this environment requires "gemini-2.5-flash". Attempting to "correct" it based on general knowledge caused a 404 error.
**Action:** Trust existing model names in the codebase unless there's a proven reason to change them. Always verify model availability in the specific target environment if possible.
