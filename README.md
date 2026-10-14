# Ritesh Sharma's Cybersecurity Portfolio

Welcome! This is a personal portfolio built with React and Vite to showcase Ritesh's cybersecurity experience, skills, projects, certifications, and learning journey. It also includes a public learning blog and an optional private admin area for managing blog posts.

## What's in the project?

- A portfolio with profile, skills, experience, projects, certifications, and learning sections.
- A public blog at `/blog` for published learning notes.
- A private blog dashboard at `/admin` for writing and managing posts. Blog storage and sign-in use Supabase when configured.
- A responsive web app that can run locally during development and be built for deployment.

## Open and run it in VS Code

### 1. Install the prerequisites

- Install [Node.js](https://nodejs.org/) (the LTS version is recommended). npm is included with Node.js.
- Install [Visual Studio Code](https://code.visualstudio.com/).

### 2. Open the project

1. Download or clone this repository to your computer.
2. Open VS Code.
3. Select **File → Open Folder...** and choose the project folder, `my-portfolio`.
4. Open the integrated terminal with **Terminal → New Terminal**.

### 3. Install dependencies and start the development server

Run these commands in the VS Code terminal from the project folder:

```bash
npm install
npm run dev
```

Vite prints a local URL in the terminal, usually `http://localhost:5173`. Ctrl-click that URL (or copy it into your browser) to view the portfolio. Keep the terminal running while you work; changes are usually reflected in the browser automatically. Stop the server with **Ctrl+C**.

To check a production build, run:

```bash
npm run build
```

## Update portfolio content

Most personal and resume information is in `src/data/`:

- `profile.js` — name, contact details, career summary, and external links
- `skills.js` — skill groups and technologies
- `experience.js` — internships and learning outcomes
- `projects.js` — project descriptions, features, and GitHub links
- `certifications.js` — certifications and skills learned
- `learning.js` — TryHackMe and lab journey

Add the resume PDF as `public/resume.pdf`, then update the placeholder LinkedIn, GitHub, and TryHackMe URLs in `src/data/profile.js`. Update project GitHub links in `src/data/projects.js`.

## Optional: configure the blog and admin area

The blog requires Supabase for post storage and password-based admin sign-in. Without configuration, the blog and admin pages display a setup notice; posts are not saved to browser-only storage.

1. Create a Supabase project.
2. In the Supabase SQL Editor, run [`supabase/schema.sql`](./supabase/schema.sql).
3. In Supabase Authentication settings, turn off public sign-ups. Create the admin user in the Supabase dashboard and copy that user's ID.
4. Add the user to the admin allow-list in the SQL Editor, replacing the example UUID with the copied ID:

   ```sql
   insert into public.blog_admins (user_id)
   values ('00000000-0000-0000-0000-000000000000');
   ```

   Only users in this table can create, edit, publish, or delete posts. Row-level security enforces permissions in the database.
5. Copy `.env.example` to `.env.local` and add your Supabase project URL and public anon/publishable key. Never add a Supabase service-role key to this frontend project.
6. Restart the development server. Visit `/admin` to sign in and manage Markdown posts. Published posts appear at `/blog`.

The admin link is in the site footer. Account creation and password reset are not exposed on the public site; manage admin accounts in Supabase.

## Deploy

Push the repository to GitHub, import it into Vercel, select the Vite framework preset, and deploy. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the deployment environment if using the blog. For other static hosts, configure an SPA fallback to `index.html` so client-side routes work.
