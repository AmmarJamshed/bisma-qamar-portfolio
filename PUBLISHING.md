# Publish this portfolio

## Interactive website (primary) — **LIVE on Vercel**

**Public URL:** https://bisma-qamar-portfolio.vercel.app

The **`website/`** folder is a full single-page portfolio with photo, UN-themed design, tabs, timeline, and contact form. Deployed via Vercel (`vercel.json` → `outputDirectory: website`). GitHub repo is linked for automatic redeploys on push to `main`.

**Preview locally:**
```bash
cd website
npx serve -l 8080
```
Open **http://localhost:8080**

**Deploy options:** GitHub Pages (serve `website/` as root), Netlify, Vercel, or Cloudflare Pages — point the site root to the `website` folder.

**Photo:** `website/assets/bisma-qamar.jpg` (from public LinkedIn profile). Replace with a higher-res official headshot anytime.

---

## GitBook (optional — text version)

This folder is also a **GitBook-compatible** documentation site (Markdown + `SUMMARY.md` + `.gitbook.yaml`).

---

## Option A — GitBook.com (recommended)

**Repository (live):** [github.com/AmmarJamshed/bisma-qamar-portfolio](https://github.com/AmmarJamshed/bisma-qamar-portfolio)

**One-click import (sign in with GitHub first):**  
[app.gitbook.com/import/github?owner=AmmarJamshed&repo=bisma-qamar-portfolio](https://app.gitbook.com/import/github?owner=AmmarJamshed&repo=bisma-qamar-portfolio)

1. Open the import link above → **Continue with GitHub** (account: AmmarJamshed).
2. Confirm the repo **bisma-qamar-portfolio** — GitBook reads `SUMMARY.md` and `.gitbook.yaml`.
3. Space settings → title **Bisma Qamar**, visibility **Public**.
4. Optional: add cover image and space logo in GitBook’s editor.

**Sync:** Push to `main` on GitHub → GitBook syncs automatically (Git Sync).

**Static preview (GitHub Pages, already deployed):**  
[ammarjamshed.github.io/bisma-qamar-portfolio](https://ammarjamshed.github.io/bisma-qamar-portfolio/) — Honkit build of the same Markdown; use while setting up GitBook.com or as a backup URL.

---

## Option B — Preview locally (optional)

Install GitBook CLI (legacy) or use any Markdown previewer:

```bash
cd bisma-qamar-portfolio
npx honkit serve
```

Or open `README.md` in VS Code / Cursor with Markdown preview.

---

## Before you share publicly

- [x] Email set: **bisma.qamar@pstd.com.pk**
- [x] Titles & dates reviewed against LinkedIn (May 2026)
- [ ] Add a professional headshot in GitBook space settings (optional)
- [ ] Re-sync after major LinkedIn role changes

---

## Push to GitHub (first time)

```bash
cd "C:\Users\User\.cursor\projects\D-DevStorage-Temp-28b8c347-abcc-442e-8055-bc20e76185aa\bisma-qamar-portfolio"
git init
git add .
git commit -m "Add Bisma Qamar GitBook portfolio"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bisma-qamar-portfolio.git
git push -u origin main
```

---

## File map

| File | Purpose |
|------|---------|
| `README.md` | Home page |
| `SUMMARY.md` | GitBook navigation |
| `.gitbook.yaml` | GitBook metadata |
| `career.md` | Roles & experience |
| `united-nations.md` | UN / PMYP diplomacy |
| `publications.md` | IPS & writing |
| `speaking.md` | Talks & workshops |
| `press.md` | Third-party coverage |
| `achievements.md` | Timeline |
| `contact.md` | Links & inquiry |

---

Questions? Edit content in Markdown and push to GitHub—GitBook will update the live site.
