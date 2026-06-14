import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const cfg = window.PORTFOLIO_CONFIG || {};
const defaults = window.PORTFOLIO_DEFAULT_CONTENT || {};
const ADMIN_USERNAME = "bismaqamar";

let supabase = null;
let content = structuredClone(defaults);
let activePanel = "hero";
let formBound = false;

const TEMPLATES = {
  stats: { count: 0, suffix: "+", label: "New stat" },
  "about.highlights": { title: "New highlight", text: "" },
  roles: { org: "", title: "", body: "", linkUrl: "", linkText: "" },
  publications: { date: "", title: "", summary: "", outlet: "", url: "" },
  timeline: { year: "", title: "", body: "" },
  "media.videos": { title: "New video", url: "", caption: "" },
  "media.gallery": { title: "New photo", imageUrl: "", caption: "" },
  customSections: () => ({
    id: crypto.randomUUID(),
    title: "New section",
    subtitle: "",
    navLabel: "New section",
    showInNav: true,
    items: [],
  }),
  "customSections.items": { type: "text", title: "New item", body: "", url: "", imageUrl: "", caption: "" },
};

function $(id) {
  return document.getElementById(id);
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

function field(label, name, value, type = "text", rows) {
  if (type === "textarea") {
    return `<label>${label}<textarea name="${name}" rows="${rows || 3}">${escapeHtml(value || "")}</textarea></label>`;
  }
  if (type === "checkbox") {
    const checked = value ? " checked" : "";
    return `<label class="checkbox-label"><input type="checkbox" name="${name}" value="1"${checked} /> ${label}</label>`;
  }
  return `<label>${label}<input type="${type}" name="${name}" value="${escapeAttr(value ?? "")}" /></label>`;
}

function blockHeader(title, arrayPath, index, minItems = 0) {
  const canRemove = index >= minItems;
  return `<div class="repeat-head">
    <h3>${title}</h3>
    ${canRemove ? `<button type="button" class="btn btn-danger btn-small" data-remove="${arrayPath}" data-index="${index}">Remove</button>` : ""}
  </div>`;
}

function addBtn(arrayPath, label) {
  return `<button type="button" class="btn btn-outline btn-add" data-add="${arrayPath}">+ ${label}</button>`;
}

function getPath(obj, path) {
  return path.split(".").reduce((cur, key) => cur?.[/^\d+$/.test(key) ? Number(key) : key], obj);
}

function ensurePath(obj, path) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i];
    const k = /^\d+$/.test(key) ? Number(key) : key;
    const next = parts[i + 1];
    if (i === parts.length - 1) return cur;
    if (cur[k] === undefined) cur[k] = next && /^\d+$/.test(next) ? [] : {};
    cur = cur[k];
  }
  return cur;
}

function setNested(obj, path, rawValue) {
  const parts = path.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    const nextKey = parts[i + 1];
    const k = /^\d+$/.test(key) ? Number(key) : key;
    if (cur[k] === undefined) cur[k] = /^\d+$/.test(nextKey) ? [] : {};
    cur = cur[k];
  }
  const last = parts[parts.length - 1];
  const lk = /^\d+$/.test(last) ? Number(last) : last;
  if (last === "count") cur[lk] = Number(rawValue);
  else if (last === "showInNav") cur[lk] = rawValue === "1" || rawValue === true;
  else cur[lk] = rawValue;
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

function imageUploadField(label, path, url) {
  const preview = url
    ? `<img class="item-preview" src="${escapeAttr(url.startsWith("http") ? url : `../${url}`)}" alt="" />`
    : "";
  return `${preview}
    ${field(`${label} (URL or upload below)`, path, url)}
    <label>Upload image
      <input type="file" accept="image/jpeg,image/png,image/webp" data-upload="${path}" />
    </label>`;
}

function buildCustomSectionItem(secIndex, item, itemIndex) {
  const base = `customSections.${secIndex}.items.${itemIndex}`;
  const typeField = field(
    "Item type",
    `${base}.type`,
    item.type || "text",
    "text"
  ).replace(
    `name="${base}.type"`,
    `name="${base}.type"`
  );
  return `<div class="repeat-block repeat-block--nested">
    ${blockHeader(`Item ${itemIndex + 1}`, `customSections.${secIndex}.items`, itemIndex, 0)}
    <label>Item type
      <select name="${base}.type">
        <option value="text"${item.type === "text" ? " selected" : ""}>Text block</option>
        <option value="link"${item.type === "link" ? " selected" : ""}>Link</option>
        <option value="image"${item.type === "image" ? " selected" : ""}>Photo</option>
        <option value="video"${item.type === "video" ? " selected" : ""}>Video link</option>
      </select>
    </label>
    ${field("Title", `${base}.title`, item.title)}
    ${field("Text / description", `${base}.body`, item.body, "textarea", 2)}
    ${field("URL (link or video)", `${base}.url`, item.url)}
    ${imageUploadField("Photo", `${base}.imageUrl`, item.imageUrl)}
    ${field("Caption (optional)", `${base}.caption`, item.caption)}
  </div>`;
}

function buildForm() {
  const form = $("editorForm");
  form.innerHTML = `
    <section class="panel${activePanel === "hero" ? " active" : ""}" data-panel="hero">
      <h2>Home & profile photo</h2>
      <p class="panel-help">The main headline visitors see first.</p>
      <img id="photoPreview" class="photo-preview" src="${escapeAttr(resolveAssetUrl(content.hero?.photoUrl))}" alt="" />
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

    <section class="panel${activePanel === "stats" ? " active" : ""}" data-panel="stats">
      <h2>Impact numbers</h2>
      <p class="panel-help">Add or remove stats shown on the home page.</p>
      ${(content.stats || [])
        .map(
          (s, i) => `
        <div class="repeat-block">
          ${blockHeader(`Stat ${i + 1}`, "stats", i, 1)}
          ${field("Number", `stats.${i}.count`, s.count, "number")}
          ${field("Suffix (+ or empty)", `stats.${i}.suffix`, s.suffix)}
          ${field("Label", `stats.${i}.label`, s.label)}
        </div>`
        )
        .join("")}
      ${addBtn("stats", "Add stat")}
    </section>

    <section class="panel${activePanel === "about" ? " active" : ""}" data-panel="about">
      <h2>About section</h2>
      ${field("Section subtitle", "about.subtitle", content.about?.subtitle)}
      ${field("Paragraph 1", "about.paragraph1", content.about?.paragraph1, "textarea", 4)}
      ${field("Paragraph 2", "about.paragraph2", content.about?.paragraph2, "textarea", 4)}
      ${field("Location", "about.base", content.about?.base)}
      ${field("Education", "about.education", content.about?.education)}
      ${field("Languages", "about.languages", content.about?.languages)}
      ${field("Email", "about.email", content.about?.email, "email")}
      <h3 class="subheading">Highlight cards</h3>
      ${(content.about?.highlights || [])
        .map(
          (h, i) => `
        <div class="repeat-block">
          ${blockHeader(`Highlight ${i + 1}`, "about.highlights", i, 1)}
          ${field("Title", `about.highlights.${i}.title`, h.title)}
          ${field("Text", `about.highlights.${i}.text`, h.text, "textarea", 2)}
        </div>`
        )
        .join("")}
      ${addBtn("about.highlights", "Add highlight")}
    </section>

    <section class="panel${activePanel === "empower" ? " active" : ""}" data-panel="empower">
      <h2>Empowerment section</h2>
      ${field("Kicker", "empowerment.kicker", content.empowerment?.kicker)}
      ${field("Title", "empowerment.title", content.empowerment?.title)}
      ${field("Intro", "empowerment.intro", content.empowerment?.intro, "textarea", 3)}
      ${field("Quote", "empowerment.quote", content.empowerment?.quote, "textarea", 2)}
      ${field("Quote source", "empowerment.quoteCite", content.empowerment?.quoteCite)}
    </section>

    <section class="panel${activePanel === "roles" ? " active" : ""}" data-panel="roles">
      <h2>Current roles</h2>
      ${(content.roles || [])
        .map(
          (r, i) => `
        <div class="repeat-block">
          ${blockHeader(`Role ${i + 1}`, "roles", i, 1)}
          ${field("Organization", `roles.${i}.org`, r.org)}
          ${field("Job title", `roles.${i}.title`, r.title)}
          ${field("Description", `roles.${i}.body`, r.body, "textarea", 3)}
          ${field("Link URL (optional)", `roles.${i}.linkUrl`, r.linkUrl)}
          ${field("Link text (optional)", `roles.${i}.linkText`, r.linkText)}
        </div>`
        )
        .join("")}
      ${addBtn("roles", "Add role")}
    </section>

    <section class="panel${activePanel === "media" ? " active" : ""}" data-panel="media">
      <h2>Videos & photos</h2>
      <p class="panel-help">Paste YouTube/Vimeo links or upload photos. This section appears on the site when you add at least one video or photo.</p>
      ${field("Section title", "media.title", content.media?.title)}
      ${field("Section intro", "media.subtitle", content.media?.subtitle, "textarea", 2)}
      <h3 class="subheading">Videos</h3>
      ${(content.media?.videos || [])
        .map(
          (v, i) => `
        <div class="repeat-block">
          ${blockHeader(`Video ${i + 1}`, "media.videos", i, 0)}
          ${field("Title", `media.videos.${i}.title`, v.title)}
          ${field("Video URL (YouTube, Vimeo, or direct link)", `media.videos.${i}.url`, v.url)}
          ${field("Caption (optional)", `media.videos.${i}.caption`, v.caption, "textarea", 2)}
        </div>`
        )
        .join("")}
      ${addBtn("media.videos", "Add video link")}
      <h3 class="subheading">Photo gallery</h3>
      ${(content.media?.gallery || [])
        .map(
          (g, i) => `
        <div class="repeat-block">
          ${blockHeader(`Photo ${i + 1}`, "media.gallery", i, 0)}
          ${field("Title", `media.gallery.${i}.title`, g.title)}
          ${imageUploadField("Photo", `media.gallery.${i}.imageUrl`, g.imageUrl)}
          ${field("Caption (optional)", `media.gallery.${i}.caption`, g.caption, "textarea", 2)}
        </div>`
        )
        .join("")}
      ${addBtn("media.gallery", "Add photo")}
    </section>

    <section class="panel${activePanel === "publications" ? " active" : ""}" data-panel="publications">
      <h2>Publications</h2>
      ${(content.publications || [])
        .map(
          (p, i) => `
        <div class="repeat-block">
          ${blockHeader(`Publication ${i + 1}`, "publications", i, 1)}
          ${field("Date", `publications.${i}.date`, p.date)}
          ${field("Title", `publications.${i}.title`, p.title)}
          ${field("Summary", `publications.${i}.summary`, p.summary)}
          ${field("Outlet", `publications.${i}.outlet`, p.outlet)}
          ${field("URL", `publications.${i}.url`, p.url)}
        </div>`
        )
        .join("")}
      ${addBtn("publications", "Add publication")}
    </section>

    <section class="panel${activePanel === "timeline" ? " active" : ""}" data-panel="timeline">
      <h2>Career timeline</h2>
      ${(content.timeline || [])
        .map(
          (t, i) => `
        <div class="repeat-block">
          ${blockHeader(`Milestone ${i + 1}`, "timeline", i, 1)}
          ${field("Year", `timeline.${i}.year`, t.year)}
          ${field("Title", `timeline.${i}.title`, t.title)}
          ${field("Details", `timeline.${i}.body`, t.body, "textarea", 3)}
        </div>`
        )
        .join("")}
      ${addBtn("timeline", "Add milestone")}
    </section>

    <section class="panel${activePanel === "custom" ? " active" : ""}" data-panel="custom">
      <h2>Custom sections</h2>
      <p class="panel-help">Create new sections on your site — e.g. Awards, Speaking, Projects. Each can have text, links, photos, and videos.</p>
      ${(content.customSections || [])
        .map((sec, si) => {
          const items = (sec.items || [])
            .map((item, ii) => buildCustomSectionItem(si, item, ii))
            .join("");
          return `
        <div class="repeat-block repeat-block--section">
          ${blockHeader(`Section: ${sec.title || "Untitled"}`, "customSections", si, 0)}
          <input type="hidden" name="customSections.${si}.id" value="${escapeAttr(sec.id)}" />
          ${field("Section title", `customSections.${si}.title`, sec.title)}
          ${field("Intro text", `customSections.${si}.subtitle`, sec.subtitle, "textarea", 2)}
          ${field("Menu label (short)", `customSections.${si}.navLabel`, sec.navLabel)}
          ${field("Show in site menu", `customSections.${si}.showInNav`, sec.showInNav, "checkbox")}
          <h4 class="subheading">Items in this section</h4>
          ${items}
          ${addBtn(`customSections.${si}.items`, "Add item to this section")}
        </div>`;
        })
        .join("")}
      ${addBtn("customSections", "Create new section")}
    </section>

    <section class="panel${activePanel === "contact" ? " active" : ""}" data-panel="contact">
      <h2>Contact</h2>
      ${field("Section title", "contact.title", content.contact?.title)}
      ${field("Intro text", "contact.intro", content.contact?.intro, "textarea", 2)}
      ${field("Email", "contact.email", content.contact?.email, "email")}
      ${field("LinkedIn URL", "contact.linkedinUrl", content.contact?.linkedinUrl)}
      ${field("IPS author page URL", "contact.ipsUrl", content.contact?.ipsUrl)}
    </section>
  `;

  bindFormEvents();
}

function resolveAssetUrl(url) {
  if (!url) return "../assets/bisma-qamar.jpg";
  if (url.startsWith("http")) return url;
  return `../${url}`;
}

function syncFormToContent() {
  readFormIntoContent();
}

function addItem(arrayPath) {
  syncFormToContent();
  let template = TEMPLATES[arrayPath];
  if (!template && arrayPath.endsWith(".items")) template = TEMPLATES["customSections.items"];
  const arr = getPath(content, arrayPath);
  if (!Array.isArray(arr)) return;
  const item = typeof template === "function" ? template() : structuredClone(template);
  arr.push(item);
  buildForm();
}

function removeItem(arrayPath, index) {
  syncFormToContent();
  getPath(content, arrayPath)?.splice(index, 1);
  buildForm();
}

function readFormIntoContent() {
  if (!content.media) content.media = { title: "", subtitle: "", videos: [], gallery: [] };
  if (!content.customSections) content.customSections = [];

  const next = {
    ...structuredClone(content),
    stats: [],
    roles: [],
    publications: [],
    timeline: [],
    customSections: [],
    about: { ...content.about, highlights: [] },
    media: {
      title: content.media?.title || "",
      subtitle: content.media?.subtitle || "",
      videos: [],
      gallery: [],
    },
  };

  const form = $("editorForm");
  const data = new FormData(form);
  for (const [name, value] of data.entries()) {
    if (name.includes(".")) setNested(next, name, value);
  }

  (next.customSections || []).forEach((sec, i) => {
    const checkbox = form.querySelector(`[name="customSections.${i}.showInNav"]`);
    sec.showInNav = Boolean(checkbox?.checked);
  });

  next.hero.photoUrl = content.hero?.photoUrl || next.hero?.photoUrl;
  next.meta = content.meta || {};
  next.meta.pageTitle = `${next.hero.name} | Woman Empowerment & Global Youth Leadership`;
  next.meta.description = `${next.hero.name} — ${next.hero.badgePrimary}, DE&I leader, PMYP UN youth focal person.`;
  next.about.email = next.contact.email;

  content = next;
}

function bindFormEvents() {
  const form = $("editorForm");

  form.querySelectorAll("[data-add]").forEach((btn) => {
    btn.onclick = () => addItem(btn.dataset.add);
  });

  form.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.onclick = () => removeItem(btn.dataset.remove, Number(btn.dataset.index));
  });

  form.querySelectorAll("[data-upload]").forEach((input) => {
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const path = input.dataset.upload;
      try {
        $("saveStatus").textContent = "Uploading…";
        const url = await uploadFile(file, "gallery");
        setNested(content, path, url);
        readFormIntoContent();
        setNested(content, path, url);
        buildForm();
        $("saveStatus").textContent = "Uploaded — click Save changes";
        $("saveStatus").className = "status ok";
      } catch (err) {
        $("saveStatus").textContent = err.message;
        $("saveStatus").className = "status";
      }
    };
  });

  if (!formBound) {
    formBound = true;
    $("editorNav")?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-section]");
      if (!btn) return;
      syncFormToContent();
      activePanel = btn.dataset.section;
      document.querySelectorAll(".editor-nav button").forEach((b) => b.classList.toggle("active", b === btn));
      document.querySelectorAll(".panel").forEach((p) =>
        p.classList.toggle("active", p.dataset.panel === activePanel)
      );
    });
  }
}

function initClient() {
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    throw new Error("Supabase is not configured yet. See ADMIN_SETUP.md.");
  }
  supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
}

function usernameToEmail(username) {
  const u = username.trim().toLowerCase();
  if (u.includes("@")) return u;
  return `${u}@${cfg.adminEmailDomain || "portfolio.admin"}`;
}

async function loadContent() {
  const { data, error } = await supabase.from("portfolio_content").select("content").eq("id", 1).maybeSingle();
  if (error) throw error;
  content = mergeContent(data?.content);
}

async function saveContent() {
  readFormIntoContent();
  const { error } = await supabase
    .from("portfolio_content")
    .upsert({ id: 1, content, updated_at: new Date().toISOString() }, { onConflict: "id" });
  if (error) throw error;
}

async function uploadFile(file, prefix = "photo") {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${prefix}-${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage.from("portfolio-photos").upload(path, file, {
    upsert: true,
    contentType: file.type,
  });
  if (upErr) throw upErr;
  const { data } = supabase.storage.from("portfolio-photos").getPublicUrl(path);
  return data.publicUrl;
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
      const url = await uploadFile(file, "profile");
      content.hero.photoUrl = url;
      $("photoPreview").src = url;
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
  try {
    initClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: usernameToEmail($("loginUser").value),
      password: $("loginPass").value,
    });
    if (error) throw error;
    await loadContent();
    showEditor();
  } catch (err) {
    errEl.textContent = err.message || "Sign in failed.";
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
