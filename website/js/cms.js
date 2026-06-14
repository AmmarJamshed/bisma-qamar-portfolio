/**
 * Loads portfolio content from Supabase and applies it to the page.
 */
(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const defaults = window.PORTFOLIO_DEFAULT_CONTENT || {};

  function el(sel) {
    return document.querySelector(sel);
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setText(selector, value) {
    const node = el(selector);
    if (node && value != null) node.textContent = value;
  }

  function setAttr(selector, attr, value) {
    const node = el(selector);
    if (node && value != null) node.setAttribute(attr, value);
  }

  function mergeContent(remote) {
    const base = structuredClone(defaults);
    if (!remote) return base;
    return {
      ...base,
      ...remote,
      hero: { ...base.hero, ...remote.hero },
      about: { ...base.about, ...remote.about, highlights: remote.about?.highlights ?? base.about.highlights },
      empowerment: { ...base.empowerment, ...remote.empowerment },
      contact: { ...base.contact, ...remote.contact },
      media: {
        ...base.media,
        ...remote.media,
        videos: remote.media?.videos ?? base.media?.videos ?? [],
        gallery: remote.media?.gallery ?? base.media?.gallery ?? [],
      },
      stats: remote.stats ?? base.stats,
      roles: remote.roles ?? base.roles,
      publications: remote.publications ?? base.publications,
      timeline: remote.timeline ?? base.timeline,
      customSections: remote.customSections ?? base.customSections ?? [],
    };
  }

  function videoEmbedUrl(url) {
    if (!url) return null;
    const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    const vm = url.match(/vimeo\.com\/(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    if (/\.(mp4|webm)(\?|$)/i.test(url)) return url;
    return null;
  }

  function renderMedia(c) {
    const mediaSec = el("#media");
    const videosEl = el("#mediaVideos");
    const galleryEl = el("#mediaGallery");
    const navMedia = el("#navMedia");
    const videos = c.media?.videos || [];
    const gallery = c.media?.gallery || [];
    const hasMedia = videos.length > 0 || gallery.length > 0;

    if (mediaSec) mediaSec.hidden = !hasMedia;
    if (navMedia) navMedia.hidden = !hasMedia;

    setText("[data-cms='media.title']", c.media?.title);
    setText("[data-cms='media.subtitle']", c.media?.subtitle);

    if (videosEl) {
      videosEl.innerHTML = videos
        .filter((v) => v.url)
        .map((v) => {
          const embed = videoEmbedUrl(v.url);
          const player = embed
            ? `<div class="video-wrap"><iframe src="${escapeHtml(embed)}" title="${escapeHtml(v.title || "Video")}" allowfullscreen loading="lazy"></iframe></div>`
            : `<a href="${escapeHtml(v.url)}" class="video-link" target="_blank" rel="noopener">Watch video →</a>`;
          return `<article class="media-video-card">
            <h3>${escapeHtml(v.title || "Video")}</h3>
            ${player}
            ${v.caption ? `<p>${escapeHtml(v.caption)}</p>` : ""}
          </article>`;
        })
        .join("");
    }

    if (galleryEl) {
      galleryEl.innerHTML = gallery
        .filter((g) => g.imageUrl)
        .map(
          (g) => `<figure class="gallery-card">
            <img src="${escapeHtml(g.imageUrl)}" alt="${escapeHtml(g.title || "Photo")}" loading="lazy" />
            ${g.title ? `<figcaption><strong>${escapeHtml(g.title)}</strong>${g.caption ? ` — ${escapeHtml(g.caption)}` : ""}</figcaption>` : g.caption ? `<figcaption>${escapeHtml(g.caption)}</figcaption>` : ""}
          </figure>`
        )
        .join("");
    }
  }

  function renderCustomItem(item) {
    const type = item.type || "text";
    if (type === "link" && item.url) {
      return `<a href="${escapeHtml(item.url)}" class="custom-item custom-item--link" target="_blank" rel="noopener">
        <h3>${escapeHtml(item.title || "Link")}</h3>
        ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
        <span class="custom-link-arrow">Open link →</span>
      </a>`;
    }
    if (type === "image" && item.imageUrl) {
      return `<figure class="custom-item custom-item--image">
        <img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title || "Photo")}" loading="lazy" />
        ${item.title || item.caption ? `<figcaption><strong>${escapeHtml(item.title || "")}</strong>${item.caption ? ` ${escapeHtml(item.caption)}` : ""}</figcaption>` : ""}
      </figure>`;
    }
    if (type === "video" && item.url) {
      const embed = videoEmbedUrl(item.url);
      const player = embed
        ? `<div class="video-wrap"><iframe src="${escapeHtml(embed)}" title="${escapeHtml(item.title || "Video")}" allowfullscreen loading="lazy"></iframe></div>`
        : `<a href="${escapeHtml(item.url)}" target="_blank" rel="noopener">Watch video →</a>`;
      return `<article class="custom-item custom-item--video">
        <h3>${escapeHtml(item.title || "Video")}</h3>
        ${player}
        ${item.caption ? `<p>${escapeHtml(item.caption)}</p>` : ""}
      </article>`;
    }
    return `<article class="custom-item custom-item--text">
      ${item.title ? `<h3>${escapeHtml(item.title)}</h3>` : ""}
      ${item.body ? `<p>${escapeHtml(item.body)}</p>` : ""}
    </article>`;
  }

  function renderCustomSections(c) {
    const root = el("#customSectionsRoot");
    const navLinks = el("#navLinks");
    const contactLi = navLinks?.querySelector('a[href="#contact"]')?.closest("li");

    navLinks?.querySelectorAll("[data-custom-nav]").forEach((n) => n.remove());

    if (!root) return;
    const sections = c.customSections || [];
    root.innerHTML = sections
      .map((sec) => {
        const items = (sec.items || []).map(renderCustomItem).join("");
        return `<section id="section-${escapeHtml(sec.id)}" class="section section-custom">
          <div class="container">
            <div class="section-head reveal">
              <h2>${escapeHtml(sec.title || "Section")}</h2>
              ${sec.subtitle ? `<p>${escapeHtml(sec.subtitle)}</p>` : ""}
            </div>
            <div class="custom-items reveal">${items}</div>
          </div>
        </section>`;
      })
      .join("");

    sections.forEach((sec) => {
      if (!sec.showInNav || !contactLi || !navLinks) return;
      const li = document.createElement("li");
      li.setAttribute("data-custom-nav", sec.id);
      li.innerHTML = `<a href="#section-${escapeHtml(sec.id)}" class="nav-link">${escapeHtml(sec.navLabel || sec.title || "Section")}</a>`;
      navLinks.insertBefore(li, contactLi);
    });
  }

  function applyContent(c) {
    if (!c) return;

    document.title = c.meta?.pageTitle || document.title;
    const desc = el('meta[name="description"]');
    if (desc && c.meta?.description) desc.setAttribute("content", c.meta.description);

    setText("[data-cms='hero.badgePrimary']", c.hero?.badgePrimary);
    setText("[data-cms='hero.badgeOutline']", c.hero?.badgeOutline);
    setText("[data-cms='hero.name']", c.hero?.name);
    setText("[data-cms='hero.tagline']", c.hero?.tagline);
    setText("[data-cms='hero.lead']", c.hero?.lead);
    setText("[data-cms='hero.floatingLabel']", c.hero?.floatingLabel);
    setText("[data-cms='hero.floatingTitle']", c.hero?.floatingTitle);
    setText("[data-cms='hero.floatingSub']", c.hero?.floatingSub);

    const photo = el("[data-cms='hero.photo']");
    if (photo && c.hero?.photoUrl) {
      photo.src = c.hero.photoUrl;
      photo.alt = `${c.hero.name || "Bisma Qamar"} — professional portrait`;
    }

    const linkedin = el("[data-cms='hero.linkedin']");
    if (linkedin && c.hero?.linkedinUrl) linkedin.href = c.hero.linkedinUrl;

    const stats = el("#statsBar");
    if (stats && Array.isArray(c.stats)) {
      stats.innerHTML = c.stats
        .map(
          (s, i) => `
        <div class="stat stat--un-${(i % 4) + 1}" data-count="${s.count}">
          <span class="stat-num"><span class="counter">0</span>${s.suffix || ""}</span>
          <span class="stat-label">${escapeHtml(s.label)}</span>
        </div>`
        )
        .join("");
    }

    setText("[data-cms='about.subtitle']", c.about?.subtitle);
    setText("[data-cms='about.p1']", c.about?.paragraph1);
    setText("[data-cms='about.p2']", c.about?.paragraph2);
    setText("[data-cms='about.base']", c.about?.base);
    setText("[data-cms='about.education']", c.about?.education);
    setText("[data-cms='about.languages']", c.about?.languages);

    const aboutEmail = el("[data-cms='about.email']");
    if (aboutEmail && c.about?.email) {
      aboutEmail.textContent = c.about.email;
      aboutEmail.href = `mailto:${c.about.email}`;
    }

    const highlights = el("#aboutHighlights");
    if (highlights && Array.isArray(c.about?.highlights)) {
      const classes = ["h-card--un-a", "h-card--un-b", "h-card--un-c"];
      highlights.innerHTML = c.about.highlights
        .map(
          (h, i) => `
        <article class="highlight-card ${classes[i % 3] || ""}">
          <h3>${escapeHtml(h.title)}</h3>
          <p>${escapeHtml(h.text)}</p>
        </article>`
        )
        .join("");
    }

    setText("[data-cms='empower.kicker']", c.empowerment?.kicker);
    setText("[data-cms='empower.title']", c.empowerment?.title);
    setText("[data-cms='empower.intro']", c.empowerment?.intro);
    setText("[data-cms='empower.quote']", `"${c.empowerment?.quote || ""}"`);
    const citeEl = el("[data-cms='empower.quoteCite']");
    if (citeEl && c.empowerment?.quoteCite) citeEl.textContent = `— ${c.empowerment.quoteCite}`;

    const roleCards = el("#roleCards");
    if (roleCards && Array.isArray(c.roles)) {
      const cardClass = ["role-card--pmyp", "role-card--pstd", "role-card--un"];
      const logos = [
        '<img src="assets/logos/pmyp.png" alt="" class="role-card-logo role-card-logo--pmyp" width="180" height="48" />',
        '<img src="assets/logos/pstd.png" alt="" class="role-card-logo role-card-logo--pstd" width="130" height="52" />',
        '<img src="assets/logos/un-emblem.svg" alt="" class="role-card-logo role-card-logo--un" width="48" height="48" />',
      ];
      roleCards.innerHTML = c.roles
        .map((r, i) => {
          const link =
            r.linkUrl && r.linkText
              ? `<a href="${escapeHtml(r.linkUrl)}" class="role-link" target="_blank" rel="noopener">${escapeHtml(r.linkText)}</a>`
              : r.linkUrl
                ? `<a href="${escapeHtml(r.linkUrl)}" class="role-link">${escapeHtml(r.linkText || r.linkUrl)}</a>`
                : "";
          return `
        <article class="role-card ${cardClass[i % 3] || ""}">
          ${logos[i] || ""}
          <h3>${escapeHtml(r.org)}</h3>
          <p class="role-title">${escapeHtml(r.title)}</p>
          <p>${escapeHtml(r.body)}</p>
          ${link}
        </article>`;
        })
        .join("");
    }

    const pubGrid = el("#pubGrid");
    if (pubGrid && Array.isArray(c.publications)) {
      pubGrid.innerHTML = c.publications
        .map(
          (p) => `
        <a href="${escapeHtml(p.url)}" class="pub-card" target="_blank" rel="noopener">
          <span class="pub-date">${escapeHtml(p.date)}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(p.summary)}</p>
          <span class="pub-outlet">${escapeHtml(p.outlet)}</span>
        </a>`
        )
        .join("");
    }

    const timeline = el("#timelineList");
    if (timeline && Array.isArray(c.timeline)) {
      timeline.innerHTML = c.timeline
        .map(
          (t, i) => `
        <div class="tl-item${i === 0 ? " active" : ""}">
          <button class="tl-trigger" aria-expanded="${i === 0 ? "true" : "false"}">
            <span class="tl-year">${escapeHtml(t.year)}</span>
            <span class="tl-title">${escapeHtml(t.title)}</span>
          </button>
          <div class="tl-body"${i === 0 ? "" : " hidden"}>
            <p>${escapeHtml(t.body)}</p>
          </div>
        </div>`
        )
        .join("");
    }

    renderMedia(c);
    renderCustomSections(c);

    setText("[data-cms='contact.title']", c.contact?.title);
    setText("[data-cms='contact.intro']", c.contact?.intro);

    const emailText = el("#emailText");
    if (emailText && c.contact?.email) {
      emailText.textContent = c.contact.email;
      emailText.href = `mailto:${c.contact.email}`;
    }

    const contactLinkedin = el("[data-cms='contact.linkedin']");
    if (contactLinkedin && c.contact?.linkedinUrl) contactLinkedin.href = c.contact.linkedinUrl;

    const contactIps = el("[data-cms='contact.ips']");
    if (contactIps && c.contact?.ipsUrl) contactIps.href = c.contact.ipsUrl;

    window.dispatchEvent(new CustomEvent("portfolio:content-applied"));
  }

  async function loadFromSupabase() {
    if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) return null;
    const url = `${cfg.supabaseUrl.replace(/\/$/, "")}/rest/v1/portfolio_content?id=eq.1&select=content`;
    const res = await fetch(url, {
      headers: {
        apikey: cfg.supabaseAnonKey,
        Authorization: `Bearer ${cfg.supabaseAnonKey}`,
      },
    });
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows?.[0]?.content) return null;
    return mergeContent(rows[0].content);
  }

  async function init() {
    try {
      const remote = await loadFromSupabase();
      applyContent(remote || defaults);
    } catch {
      applyContent(defaults);
    }
  }

  window.PortfolioCMS = { applyContent, loadFromSupabase, init, mergeContent };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
