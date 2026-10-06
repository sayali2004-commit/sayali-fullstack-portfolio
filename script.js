(() => {
  "use strict";

  const doc = document;
  const body = doc.body;

  const menuToggle = doc.querySelector(".menu-toggle");
  const siteNav = doc.querySelector(".site-nav");
  const navLinks = doc.querySelectorAll(".site-nav a");
  const backToTop = doc.querySelector(".back-to-top");
  const yearEl = doc.getElementById("year");
  const form = doc.getElementById("contact-form");
  const formStatus = doc.getElementById("form-status");
  const filterButtons = doc.querySelectorAll(".filter-btn");
  const projectCards = doc.querySelectorAll(".project-card");
  const header = doc.querySelector(".site-header");

  /* Year */
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Mobile navigation */
  const setMenuOpen = (open) => {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute("aria-expanded", open ? "true" : "false");
    menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    siteNav.classList.toggle("is-open", open);
    body.style.overflow = open ? "hidden" : "";
  };

  const isDesktopNav = () => window.matchMedia("(min-width: 1024px)").matches;

  if (menuToggle && siteNav) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      setMenuOpen(!expanded);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    doc.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
      if (isDesktopNav()) setMenuOpen(false);
    });
  }

  /* Smooth scroll with sticky header offset */
  doc.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute("href");
    if (!hash || hash === "#") return;

    const section = doc.querySelector(hash);
    if (!section) return;

    event.preventDefault();
    const headerH = header ? header.offsetHeight : 0;
    const top = section.getBoundingClientRect().top + window.scrollY - headerH - 8;
    window.scrollTo({ top, behavior: "smooth" });

    if (hash !== "#top") {
      history.pushState(null, "", hash);
    }
  });

  /* Active nav section */
  const sectionIds = ["about", "skills", "projects", "journey", "education", "contact"];
  const sections = sectionIds
    .map((id) => doc.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute("href") === `#${id}`;
            link.classList.toggle("is-active", isActive);
            if (isActive) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          });
        });
      },
      {
        rootMargin: "-40% 0px -50% 0px",
        threshold: 0.01,
      }
    );

    sections.forEach((section) => navObserver.observe(section));
  }

  /* Project filters */
  const applyFilter = (filter) => {
    projectCards.forEach((card) => {
      const categories = (card.getAttribute("data-categories") || "").split(/\s+/);
      const show = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !show);
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter") || "all";
      filterButtons.forEach((btn) => {
        const active = btn === button;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-pressed", active ? "true" : "false");
      });
      applyFilter(filter);
    });
  });

  /* Subtle reveal on scroll */
  const revealTargets = doc.querySelectorAll(
    ".section-head, .about-panel, .focus-card, .skill-group, .project-card, .timeline-item, .path-step, .edu-card, .cert-card, .contact-shell, .hero-copy, .hero-visual"
  );

  if ("IntersectionObserver" in window) {
    revealTargets.forEach((el) => el.classList.add("reveal"));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: "0px 0px -8% 0px",
        threshold: 0.08,
      }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* Back to top */
  const onScroll = () => {
    if (!backToTop) return;
    const show = window.scrollY > 480;
    backToTop.hidden = !show;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* Contact form: client-side validation + mailto handoff */
  const setFieldState = (field, invalid) => {
    field.classList.toggle("is-invalid", invalid);
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!formStatus) return;

      const nameField = form.querySelector("#name");
      const emailField = form.querySelector("#email");
      const messageField = form.querySelector("#message");

      if (!(nameField instanceof HTMLInputElement) ||
          !(emailField instanceof HTMLInputElement) ||
          !(messageField instanceof HTMLTextAreaElement)) {
        return;
      }

      const name = nameField.value.trim();
      const email = emailField.value.trim();
      const message = messageField.value.trim();

      let valid = true;

      if (!name) {
        setFieldState(nameField, true);
        valid = false;
      } else {
        setFieldState(nameField, false);
      }

      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!email) {
        setFieldState(emailField, true);
        valid = false;
      } else if (!emailOk) {
        setFieldState(emailField, true);
        valid = false;
      } else {
        setFieldState(emailField, false);
      }

      if (!message) {
        setFieldState(messageField, true);
        valid = false;
      } else {
        setFieldState(messageField, false);
      }

      if (!valid) {
        formStatus.textContent = "Please complete all fields with valid details.";
        formStatus.classList.add("is-error");
        return;
      }

      formStatus.classList.remove("is-error");
      formStatus.textContent = "Opening your email client with the message ready to send.";

      const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
      const bodyText = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\n\n${message}`
      );
      window.location.href = `mailto:sayalip547@gmail.com?subject=${subject}&body=${bodyText}`;
    });

    form.addEventListener("input", (event) => {
      const target = event.target;
      if (!(target instanceof HTMLInputElement) && !(target instanceof HTMLTextAreaElement)) return;
      if (target.classList.contains("is-invalid")) {
        setFieldState(target, false);
      }
      if (formStatus && formStatus.classList.contains("is-error")) {
        formStatus.textContent = "";
        formStatus.classList.remove("is-error");
      }
    });
  }
})();
