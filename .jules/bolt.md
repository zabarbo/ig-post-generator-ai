## 2025-05-14 - Optimized Supabase Data Fetching
**Learning:** Fetching all data and filtering on the client-side is a major performance bottleneck as the database grows. Composite indexes are crucial for optimizing queries that filter by multiple columns (e.g., user_id and status).
**Action:** Always use server-side filtering and limits when fetching lists. Add composite indexes for common query patterns.

## 2025-05-14 - Invalid Gemini Model Name
**Learning:** Using an invalid model name (e.g., "gemini-2.5-flash") can cause subtle failures or fallback to slower models.
**Action:** Always verify the correct model names in the official documentation.
