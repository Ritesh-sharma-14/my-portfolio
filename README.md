# Ritesh Sharma Cybersecurity Portfolio

Resume-driven React + Vite portfolio with a public learning blog and a private admin area for managing posts.

## Run locally

```bash
npm install
npm run dev
```

Build for production with `npm run build`.

## Blog and admin setup

The blog uses Supabase for post storage and password-based admin sign-in. Until configured, the public blog and admin pages explain that setup is needed; the site does not store posts in browser-only storage.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Supabase Authentication settings, turn off public sign-ups. Create your admin user from the Supabase dashboard, then copy that user's ID.
4. Add the user to the admin allow-list from the SQL Editor, replacing the UUID with the ID you copied:

   ```sql
   insert into public.blog_admins (user_id)
   values ('00000000-0000-0000-0000-000000000000');
   ```

   Only users in this table can create, edit, publish, or delete posts. Row-level security enforces this in the database, not just in the page UI.
5. Copy `.env.example` to `.env.local` and fill in the Supabase project URL and its public anon/publishable key. Do not put a Supabase service-role key in this frontend project.
6. Restart the dev server. Open `/admin` to sign in, write Markdown posts, save drafts, publish, edit, or delete. Published notes appear at `/blog`.

The admin link is in the site footer. Password reset and account creation are intentionally not exposed on the public site; manage admin accounts in Supabase.

## Where to update portfolio content

Personal and resume content lives in `src/data/`:

- `profile.js`: name, contact details, career summary, and external links
- `skills.js`: skill groups and technologies
- `experience.js`: internships and learning outcomes
- `projects.js`: project descriptions, features, and GitHub placeholders
- `certifications.js`: certifications and skills learned
- `learning.js`: TryHackMe/lab journey

Add the real resume PDF as `public/resume.pdf`, then replace the placeholder LinkedIn, GitHub, and TryHackMe URLs in `src/data/profile.js`. Project GitHub URLs are updated in `src/data/projects.js`.

## Deploy

Push the repository to GitHub, import it into Vercel, keep the framework preset as Vite, and deploy. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment environment variables. Vercel's Vite integration serves the client-side routes. For other static hosts, configure an SPA fallback to `index.html`.
