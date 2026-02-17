# Automated Portfolio

This project contains the codebase for my personal portfolio website. The projects displayed on the site are automatically updated through a CI/CD pipeline that retrieves repository data directly from the GitHub API, ensuring the portfolio always reflects my latest featured work.

## Tech stack

1. Next.js for the frontend

2. GitHub actions for the CI/CD pipeline

3. Vercel for hosting

4. GitHub REST API as data source

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.