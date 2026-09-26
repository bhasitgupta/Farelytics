# Farelytics Deployment Guide

## 1. Frontend Deployment on Vercel

Farelytics is optimized for Vercel deployment:
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework Preset:** Vite
- **Root Directory:** `frontend` (or repository root using `vercel.json` routing)

### Setting up Environment Variables in Vercel:
```bash
VITE_API_URL=https://farelytics.vercel.app/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## 2. Backend & Database Setup (Supabase PostgreSQL)

1. Provision a PostgreSQL instance on Supabase.
2. Execute `backend/migrations/001_initial_supabase_schema.sql` in the Supabase SQL Editor.
3. Configure backend `.env`:
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
API_PORT=8000
ENVIRONMENT=production
```

---

## 3. Production Verification

Verify deployment health:
```bash
curl -I https://farelytics.vercel.app/api/index/current
curl -I https://farelytics.vercel.app/api/quality
```
Both endpoints must return `200 OK`.
