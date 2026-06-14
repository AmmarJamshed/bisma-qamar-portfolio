(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  let coreBound = false;

  function bindCore() {
    if (coreBound) return;
    coreBound = true;

    const yearEl = $("#year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    const navToggle = $("#navToggle");
    const navLinks = $("#navLinks");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", () => {
        const open = navLinks.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", open);
      });
      $$(".nav-link").forEach((link) => {
        link.addEventListener("click", () => {
          navLinks.classList.remove("open");
          navToggle.setAttribute("aria-expanded", "false");
        });
      });
    }

    const header = $("#header");
    window.addEventListener(
      "scroll",
      () => {
        if (header) header.classList.toggle("scrolled", window.scrollY > 40);
      },
      { passive: true }
    );

    const sections = $$("section[id]");
    const navLinkEls = $$(".nav-link");
    const observerNav = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinkEls.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === `#${id}`);
            });
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => observerNav.observe(s));

    const revealEls = $$(".reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            revealObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObs.observe(el));

    $$(".un-tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        const panelId = tab.dataset.panel;
        $$(".un-tab").forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        $$(".un-panel").forEach((p) => {
          const active = p.id === panelId;
          p.classList.toggle("active", active);
          p.hidden = !active;
        });
      });
    });

    const copyBtn = $("#copyEmail");
    const emailText = $("#emailText");
    if (copyBtn && emailText) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(emailText.textContent.trim());
          copyBtn.textContent = "Copied!";
          setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
        } catch {
          copyBtn.textContent = "Copy failed";
        }
      });
    }

    const sendBtn = $("#sendEmail");
    if (sendBtn) {
      sendBtn.addEventListener("click", () => {
        const name = $("#formName")?.value || "";
        const subject = $("#formSubject")?.value || "Portfolio inquiry";
        const message = $("#formMessage")?.value || "";
        const email = emailText?.textContent?.trim() || "bisma.qamar@pstd.com.pk";
        const body = encodeURIComponent(`Name: ${name}\n\n${message}`);
        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${body}`;
      });
    }
  }

  function animateCounter(el, target) {
    const duration = 1800;
    const start = performance.now();
    const isLarge = target > 1000;
    function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.floor(eased * target);
      el.textContent = isLarge && target >= 1000 ? val.toLocaleString() : String(val);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = isLarge && target >= 1000 ? target.toLocaleString() : String(target);
    }
    requestAnimationFrame(tick);
  }

  function bindDynamic() {
    $$(".stat").forEach((s) => delete s.dataset.done);

    const statsObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const stat = entry.target;
          const target = parseInt(stat.dataset.count, 10);
          const counter = $(".counter", stat);
          if (counter && !stat.dataset.done) {
            stat.dataset.done = "1";
            animateCounter(counter, target);
          }
          statsObs.unobserve(stat);
        });
      },
      { threshold: 0.5 }
    );
    $$(".stat").forEach((s) => statsObs.observe(s));

    $$(".tl-trigger").forEach((btn) => {
      btn.replaceWith(btn.cloneNode(true));
    });
    $$(".tl-trigger").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".tl-item");
        const body = $(".tl-body", item);
        const expanded = btn.getAttribute("aria-expanded") === "true";

        $$(".tl-item").forEach((other) => {
          if (other === item) return;
          other.classList.remove("active");
          $(".tl-trigger", other).setAttribute("aria-expanded", "false");
          const b = $(".tl-body", other);
          if (b) b.hidden = true;
        });

        item.classList.toggle("active", !expanded);
        btn.setAttribute("aria-expanded", String(!expanded));
        if (body) body.hidden = expanded;
      });
    });
  }

  bindCore();
  bindDynamic();
  window.addEventListener("portfolio:content-applied", bindDynamic);
})();
