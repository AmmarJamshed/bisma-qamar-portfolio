/**
 * Loads portfolio content from Supabase and applies it to the page.
 * Falls back to HTML defaults if Supabase is not configured.
 */
(function () {
  const cfg = window.PORTFOLIO_CONFIG || {};
  const defaults = window.PORTFOLIO_DEFAULT_CONTENT || {};

  function el(sel) {
    return document.querySelector(sel);
  }

  function setText(selector, value) {
    const node = el(selector);
    if (node && value != null) node.textContent = value;
  }

  function setHtml(selector, value) {
    const node = el(selector);
    if (node && value != null) node.innerHTML = value;
  }

  function setAttr(selector, attr, value) {
    const node = el(selector);
    if (node && value != null) node.setAttribute(attr, value);
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
        <div class="stat stat--un-${i + 1}" data-count="${s.count}">
          <span class="stat-num"><span class="counter">0</span>${s.suffix || ""}</span>
          <span class="stat-label">${s.label}</span>
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
        <article class="highlight-card ${classes[i] || ""}">
          <h3>${h.title}</h3>
          <p>${h.text}</p>
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
              ? `<a href="${r.linkUrl}" class="role-link" target="_blank" rel="noopener">${r.linkText}</a>`
              : r.linkUrl
                ? `<a href="${r.linkUrl}" class="role-link">${r.linkText || r.linkUrl}</a>`
                : "";
          return `
        <article class="role-card ${cardClass[i] || ""}">
          ${logos[i] || ""}
          <h3>${r.org}</h3>
          <p class="role-title">${r.title}</p>
          <p>${r.body}</p>
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
        <a href="${p.url}" class="pub-card" target="_blank" rel="noopener">
          <span class="pub-date">${p.date}</span>
          <h3>${p.title}</h3>
          <p>${p.summary}</p>
          <span class="pub-outlet">${p.outlet}</span>
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
            <span class="tl-year">${t.year}</span>
            <span class="tl-title">${t.title}</span>
          </button>
          <div class="tl-body"${i === 0 ? "" : " hidden"}>
            <p>${t.body}</p>
          </div>
        </div>`
        )
        .join("");
    }

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
    return { ...defaults, ...rows[0].content };
  }

  async function init() {
    try {
      const remote = await loadFromSupabase();
      applyContent(remote || defaults);
    } catch {
      applyContent(defaults);
    }
  }

  window.PortfolioCMS = { applyContent, loadFromSupabase, init };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
