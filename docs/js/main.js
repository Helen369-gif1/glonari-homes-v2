/* ==========================================================
   Glonari Homes — shared behaviour (all pages)
   Smooth scroll (Lenis + GSAP ticker), header state, mobile menu,
   simple reveal for "pause" blocks.
   ========================================================== */
(() => {
  "use strict";

  const doc = document.documentElement;
  doc.classList.add("js");
  document.body.classList.remove("no-js");

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis && !reduce.matches) {
    lenis = new Lenis({ lerp: .1, smoothWheel: true });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const loop = (t) => { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }
  window.Glonari = { lenis, reduce, hasGsap };

  /* ---------- Header ----------
     Over the hero photo it stays transparent; past it (or on pages
     without a hero) it turns solid. */
  const header = document.querySelector("[data-header]");
  const hero = document.querySelector("[data-hero]");
  function updateHeader() {
    if (!header) return;
    const limit = hero ? hero.offsetTop + hero.offsetHeight - header.offsetHeight : -1;
    header.classList.toggle("is-solid", window.scrollY > limit);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
  window.addEventListener("resize", updateHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector("[data-burger]");
  const nav = document.getElementById("site-nav");
  function setMenu(open) {
    const was = doc.classList.contains("nav-open");
    doc.classList.toggle("nav-open", open);
    if (burger) burger.setAttribute("aria-expanded", String(open));
    if (lenis) open ? lenis.stop() : lenis.start();
    if (open && !was) {
      const first = nav && nav.querySelector("a[href]");
      if (first) requestAnimationFrame(() => requestAnimationFrame(() => first.focus()));
    } else if (!open && was && burger) burger.focus();
  }
  function menuFocusables() {
    return [...nav.querySelectorAll("a[href]"), burger].filter((el) => el.offsetParent !== null || el === burger);
  }
  if (burger && nav) {
    burger.addEventListener("click", () => setMenu(!doc.classList.contains("nav-open")));
    nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", (e) => {
      if (!doc.classList.contains("nav-open")) return;
      if (e.key === "Escape") { setMenu(false); return; }
      if (e.key === "Tab") {
        const f = menuFocusables(), a = document.activeElement;
        if (!f.includes(a)) { e.preventDefault(); f[0].focus(); }
        else if (e.shiftKey && a === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && a === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia("(min-width: 1101px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });
  }

  /* ---------- Active nav link ---------- */
  if (nav) {
    const here = location.pathname.split("/").pop() || "index.html";
    nav.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href").split("/").pop();
      if (href === here) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
  }

  /* ---------- Arch video (shared: Home "Find your home", How It Works 02B): plays from the first frame every time the arch comes into view ----------
     No loop. At 40% visible: rewind and play once to the end (it rests on the last frame while the arch stays
     in view; it is not restarted). When the arch leaves the viewport completely: pause and rewind, so the next
     visit starts again. Reduced motion, or a play() the browser refuses: the poster stays, silently. */
  const archVideo = document.querySelector("[data-find-video]");
  const archBox = document.querySelector("[data-find-arch]");
  if (archVideo && archBox && "IntersectionObserver" in window) {
    let playing = false;                       // true from the moment we start until the arch leaves the view
    const rewind = () => { try { archVideo.currentTime = 0; } catch (e) {} };
    const io = new IntersectionObserver((en) => {
      const e = en[en.length - 1];
      if (!e.isIntersecting) {
        if (playing) { playing = false; archVideo.pause(); rewind(); }
        return;
      }
      if (playing || e.intersectionRatio < .4 || reduce.matches) return;
      playing = true;
      rewind();
      const p = archVideo.play();
      if (p && p.catch) p.catch(() => {});
    }, { threshold: [0, .4] });
    io.observe(archBox);
  }

  /* ---------- Reveal ---------- */
  const items = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px" });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }
})();
