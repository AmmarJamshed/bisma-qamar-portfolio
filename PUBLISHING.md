# Publish this portfolio

## Interactive website (primary)

The **`website/`** folder is a full single-page portfolio with photo, UN-themed design, tabs, timeline, and contact form.

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

1. **Create a GitHub repository**
   - Push this entire `bisma-qamar-portfolio` folder to GitHub (public or private).

2. **Sign in to GitBook**
   - Go to [https://www.gitbook.com](https://www.gitbook.com) and sign in with GitHub.

3. **Import the repo**
   - **New space** → **Import from GitHub** → select your repository.
   - GitBook will detect `SUMMARY.md` and `.gitbook.yaml`.

4. **Customize**
   - Space settings → title: **Bisma Qamar**
   - Add a cover image and logo (optional) in GitBook’s visual editor.
   - Set visibility to **Public**.

5. **Update contact page**
   - Edit `contact.md` with real email/phone before sharing.

6. **Share**
   - GitBook gives you a URL like `https://bisma-qamar.gitbook.io/...`
   - Enable a custom domain later if needed.

**Sync:** Future edits: push to GitHub → GitBook syncs automatically (Git Sync).

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
