# Marks — Landing page

Standalone Next.js 14 + Tailwind site to promote the Marks Chrome extension.

## Run

```bash
npm install
npm run dev      # http://localhost:3001
```

## Deploy

```bash
npm run build    # outputs .next/
```

Push the folder to Vercel, Cloudflare Pages, or Netlify. Configure the domain `centralbraintrust.com/marks` (subpath) or `marks.centralbraintrust.com` (subdomain).

## Updating

- Edit [`app/page.tsx`](app/page.tsx) for content.
- Set `CHROME_STORE_URL` (top of `page.tsx`) once the extension is live in the store.
- Replace screenshots in [`public/`](public/) any time — same filenames.
