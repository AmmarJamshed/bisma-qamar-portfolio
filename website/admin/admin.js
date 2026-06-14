import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cfg = window.PORTFOLIO_CONFIG || {};
const defaults = window.PORTFOLIO_DEFAULT_CONTENT || {};
const ADMIN_USERNAME = "bismaqamar";
const ADMIN_EMAIL = `${ADMIN_USERNAME}@${cfg.adminEmailDomain || "portfolio.admin"}`;

let supabase = null;
let content = structuredClone(defaults);

function $(id) {
  return document.getElementById(id);
}

function usernameToEmail(username) {
  const u = username.trim().toLowerCase();
  if (u.includes("@")) return u;
  return `${u}@${cfg.adminEmailDomain || "portfolio.admin"}`;
}

function initClient() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured yet. Run scripts/setup-supabase.mjs first (see ADMIN_SETUP.md)."
    );
  }
  supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}

function field(label, name, value, type = "text", rows) {
  if (type === "textarea") {
    return `<label>${label}<textarea name="${name}" rows="${rows || 3}">${escapeHtml(value || "")}</textarea></label>`;
  }
  return `<label>${label}<input type="${type}" name="${name}" value="${escapeAttr(value ?? "")}" /></label>`;
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttr(s) {
  return escapeHtml(s).replace(/"/g, "&quot;");
}

let navBound = false;

function buildForm() {
  const form = $("editorForm");
  form.innerHTML = `
    <section class="panel active" data-panel="hero">
      <h2>Home & profile photo</h2>
      <p class="panel-help">The main headline visitors see first.</p>
      <img id="photoPreview" class="photo-preview" src="../${content.hero?.photoUrl || "assets/bisma-qamar.jpg"}" alt="" />
      <label>Upload new photo (optional)
        <input type="file" id="photoUpload" accept="image/jpeg,image/png,image/webp" />
      </label>
      ${field("Your name", "hero.name", content.hero?.name)}
      ${field("Tagline", "hero.tagline", content.hero?.tagline)}
      ${field("Introduction paragraph", "hero.lead", content.hero?.lead, "textarea", 4)}
      ${field("Badge 1", "hero.badgePrimary", content.hero?.badgePrimary)}
      ${field("Badge 2", "hero.badgeOutline", content.hero?.badgeOutline)}
      ${field("LinkedIn URL", "hero.linkedinUrl", content.hero?.linkedinUrl)}
      ${field("Highlight card title", "hero.floatingTitle", content.hero?.floatingTitle)}
      ${field("Highlight card detail", "hero.floatingSub", content.hero?.floatingSub)}
    </section>

    <section class="panel" data-panel="stats">
      <h2>Impact numbers</h2>
      <p class="panel-help">Numbers shown on the home page (animated counters).</p>
      ${content.stats
        .map(
          (s, i) => `
        <div class="repeat-block">
          <h3>Stat ${i + 1}</h3>
          ${field("Number", `stats.${i}.count`, s.count, "number")}
          ${field("Suffix (+ or empty)", `stats.${i}.suffix`, s.suffix)}
          ${field("Label", `stats.${i}.label`, s.label)}
        </div>`
        )
        .join("")}
    </section>

    <section class="panel" data-panel="about">
      <h2>About section</h2>
      ${field("Section subtitle", "about.subtitle", content.about?.subtitle)}
      ${field("Paragraph 1", "about.paragraph1", content.about?.paragraph1, "textarea", 4)}
      ${field("Paragraph 2", "about.paragraph2", content.about?.paragraph2, "textarea", 4)}
      ${field("Location", "about.base", content.about?.base)}
      ${field("Education", "about.education", content.about?.education)}
      ${field("Languages", "about.languages", content.about?.languages)}
      ${field("Email", "about.email", content.about?.email, "email")}
      ${content.about?.highlights
        ?.map(
          (h, i) => `
        <div class="repeat-block">
          <h3>Highlight ${i + 1}</h3>
          ${field("Title", `about.highlights.${i}.title`, h.title)}
          ${field("Text", `about.highlights.${i}.text`, h.text, "textarea", 2)}
        </div>`
        )
        .join("")}
    </section>

    <section class="panel" data-panel="empower">
      <h2>Empowerment section</h2>
      ${field("Kicker", "empowerment.kicker", content.empowerment?.kicker)}
      ${field("Title", "empowerment.title", content.empowerment?.title)}
      ${field("Intro", "empowerment.intro", content.empowerment?.intro, "textarea", 3)}
      ${field("Quote", "empowerment.quote", content.empowerment?.quote, "textarea", 2)}
      ${field("Quote source", "empowerment.quoteCite", content.empowerment?.quoteCite)}
    </section>

    <section class="panel" data-panel="roles">
      <h2>Current roles</h2>
      ${content.roles
        .map(
          (r, i) => `
        <div class="repeat-block">
          <h3>Role ${i + 1}</h3>
          ${field("Organization", `roles.${i}.org`, r.org)}
          ${field("Job title", `roles.${i}.title`, r.title)}
          ${field("Description", `roles.${i}.body`, r.body, "textarea", 3)}
          ${field("Link URL (optional)", `roles.${i}.linkUrl`, r.linkUrl)}
          ${field("Link text (optional)", `roles.${i}.linkText`, r.linkText)}
        </div>`
        )
        .join("")}
    </section>

    <section class="panel" data-panel="publications">
      <h2>Publications</h2>
      ${content.publications
        .map(
          (p, i) => `
        <div class="repeat-block">
          <h3>Publication ${i + 1}</h3>
          ${field("Date", `publications.${i}.date`, p.date)}
          ${field("Title", `publications.${i}.title`, p.title)}
          ${field("Summary", `publications.${i}.summary`, p.summary)}
          ${field("Outlet", `publications.${i}.outlet`, p.outlet)}
          ${field("URL", `publications.${i}.url`, p.url)}
        </div>`
        )
        .join("")}
    </section>

    <section class="panel" data-panel="timeline">
      <h2>Career timeline</h2>
      ${content.timeline
        .map(
          (t, i) => `
        <div class="repeat-block">
          <h3>Milestone ${i + 1}</h3>
          ${field("Year", `timeline.${i}.year`, t.year)}
          ${field("Title", `timeline.${i}.title`, t.title)}
          ${field("Details", `timeline.${i}.body`, t.body, "textarea", 3)}
        </div>`
        )
        .join("")}
    </section>

    <section class="panel" data-panel="contact">
      <h2>Contact</h2>
      ${field("Section title", "contact.title", content.contact?.title)}
      ${field("Intro text", "contact.intro", content.contact?.intro, "textarea", 2)}
      ${field("Email", "contact.email", content.contact?.email, "email")}
      ${field("LinkedIn URL", "contact.linkedinUrl", content.contact?.linkedinUrl)}
      ${field("IPS author page URL", "contact.ipsUrl", content.contact?.ipsUrl)}
    </section>
  `;

  if (!navBound) {
    navBound = true;
    document.getElementById("editorNav")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-section]");
      if (!btn) return;
      const section = btn.dataset.section;
      document.querySelectorAll(".editor-nav button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === section));
    });
  }
}

function $$(sel) {
  return [...document.querySelectorAll(sel)];
}

function setNested(obj, path, rawValue) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    if (cur[key] === undefined) cur[key] = /^\d+$/.test(nextKey) ? [] : {};
    cur = cur[key];
  }
  const last = parts[parts.length - 1];
  if (last === "count") cur[last] = Number(rawValue);
  else if (/^\d+$/.test(last)) cur[Number(last)] = rawValue;
  else cur[last] = rawValue;
}

function readFormIntoContent() {
  const next = structuredClone(content);
  const form = $("editorForm");
  const data = new FormData(form);
  for (const [name, value] of data.entries()) {
    if (name.includes(".")) setNested(next, name, value);
  }
  next.hero.photoUrl = content.hero?.photoUrl || next.hero.photoUrl;
  next.meta.pageTitle = `${next.hero.name} | Woman Empowerment & Global Youth Leadership`;
  next.meta.description = `${next.hero.name} — ${next.hero.badgePrimary}, DE&I leader, PMYP UN youth focal person.`;
  next.about.email = next.contact.email;
  content = next;
}

async function loadContent() {
  const { data, error } = await supabase.from("portfolio_content").select("content").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (data?.content) content = { ...defaults, ...data.content };
}

async function saveContent() {
  readFormIntoContent();
  const { error } = await supabase
    .from("portfolio_content")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

async function uploadPhoto(file) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `profile-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("portfolio-photos").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("portfolio-photos").getPublicUrl(path);
  content.hero.photoUrl = data.publicUrl;
  $("photoPreview").src = data.publicUrl;
}

function showEditor() {
  $("loginScreen").hidden = true;
  $("editorScreen").hidden = false;
  buildForm();
  $("photoUpload")?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      $("saveStatus").textContent = "Uploading photo…";
      await uploadPhoto(file);
      $("saveStatus").textContent = "Photo uploaded — click Save changes";
      $("saveStatus").className = "status ok";
    } catch (err) {
      $("saveStatus").textContent = err.message;
      $("saveStatus").className = "status";
    }
  });
}

async function checkSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    await loadContent();
    showEditor();
  }
}

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = $("loginError");
  errEl.hidden = true;
  const email = usernameToEmail($("loginUser").value);
  const password = $("loginPass").value;
  try {
    initClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await loadContent();
    showEditor();
  } catch (err) {
    errEl.textContent = err.message || "Sign in failed. Check username and password.";
    errEl.hidden = false;
  }
});

$("logoutBtn")?.addEventListener("click", async () => {
  await supabase?.auth.signOut();
  location.reload();
});

$("saveBtn")?.addEventListener("click", async () => {
  const status = $("saveStatus");
  status.textContent = "Saving…";
  status.className = "status";
  try {
    readFormIntoContent();
    await saveContent();
    status.textContent = "Saved! Live site updates within a few seconds.";
    status.className = "status ok";
  } catch (err) {
    status.textContent = err.message || "Save failed";
  }
});

try {
  initClient();
  checkSession().catch(() => {});
} catch (err) {
  $("loginError").textContent = err.message;
  $("loginError").hidden = false;
}
