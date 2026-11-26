/* ==========================================================
   Glonari Homes — Gia
   One pinned scene (motion allowed, >=769px, .has-scenes): 01 hero, ~240svh. Progress 0..1:
     0 - .12   the empty room (layer A) alone: slow parallax, scale 1 -> 1.04
     .12 - .32 Gia (layer a1, a cut-out on the same 2560x1600 canvas) comes in: opacity 0 -> 1, lift 24px, scale .985 -> 1,
               together with the line "Gia makes it easier." (desktop only); then the room and Gia move at different speeds (1.04 / 1.06: ~2.8% of the frame)
     .52 - .58 a short pause on the full composition; the line has left by .56
     .58 - .90 the group G (room + Gia, never another picture) is clipped (clip-path inset + round) and moved (translate + scale) until its clip is
               exactly the arch slot, with the same scene inside (the parallax settles back to rest on the way, so the arch shows the plain composite);
               the paper opens around it. At .90 G hands over to the real .find__arch (the same composite as a 2:3 crop, gia-hero-arch-*).
     .90 - .96 the gold outline of the arch (hidden by opacity AND visibility until G has landed at .90); .85 - 1 the headline and text on the left
   The arch shows this rectangle of the 2560x1600 canvas: x 200..1266.67, y 0..1600 (2:3): the window and Gia in the middle.
   <=768px, motion allowed: no pin; the arch photo flows into its shape while the arch scrolls into view.
   Reduced motion / no JS: the static final layout (CSS only; G and the line are not shown).
   Scrubbed timelines use fromTo only (from breaks on refresh).
   ========================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const doc = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger) { doc.classList.remove("scenes-pending"); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- 01 hero, wide ---------- */
  const CANVAS = { w: 2560, h: 1600 };
  const CROP = { x: 200, y: 0, w: 1600 * 2 / 3, h: 1600 };      // the part of the canvas the arch shows
  const A_SCALE = 1.04, WOMAN_SCALE = 1.06;                      // end-of-parallax scales (the pause state)

  function heroScene() {
    const scene = $('[data-scene="gia-hero"]');
    if (!scene) return;
    const stage = $(".scene__stage", scene);
    const g = $(".gia-hero__g", scene), canvas = $(".gia-hero__canvas", g);
    const room = $(".gia-hero__room", g);
    const a1 = $(".gia-hero__a1", g), woman = $("img", a1);
    const make = $("[data-make]", scene);
    const slot = $(".find__arch", scene), still = $(".gia-hero__still", scene);
    const kids = $$("[data-in]", scene);

    // where G has to end up so that the CROP rectangle of the canvas sits exactly on the arch slot (layout maths, independent of the playhead)
    const geo = () => {
      const st = stage.getBoundingClientRect(), sl = slot.getBoundingClientRect();
      const top = g.offsetTop, W = st.width, H = st.height - top;                // G: full width, header to bottom
      const cw = Math.max(W, H * CANVAS.w / CANVAS.h), k = cw / CANVAS.w;       // the canvas at cover size
      const px = (W - cw) / 2 + k * CROP.x, py = (H - k * CANVAS.h) / 2 + k * CROP.y;   // crop top-left, in G coordinates
      const cwd = k * CROP.w, chd = k * CROP.h;
      const sc = sl.width / cwd;
      return {
        s: sc,
        x: (sl.left - st.left) - sc * px,
        y: (sl.top - st.top - top) - sc * py,
        inset: { t: py, r: W - (px + cwd), b: H - (py + chd), l: px },
        r: cwd / 2,
      };
    };
    const end = () => { const q = geo(); return `inset(${q.inset.t}px ${q.inset.r}px ${q.inset.b}px ${q.inset.l}px round ${q.r}px ${q.r}px 0px 0px)`; };

    const tl = gsap.timeline({
      scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true },
      defaults: { ease: "none" },
    });
    // the empty room: slow parallax from the first pixel of scroll
    tl.fromTo(room, { scale: 1, yPercent: 0 }, { scale: A_SCALE, yPercent: -.55, duration: .52 }, 0)
    // Gia comes in, then moves a little faster than the room
      .fromTo(a1, { opacity: 0, y: 24, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .2, ease: "power2.out" }, .12)
      .fromTo(woman, { scale: 1 + (A_SCALE - 1) * .12 / .52 }, { scale: WOMAN_SCALE, duration: .4 }, .12)
    // the line: with Gia, gone before the flow starts
      .fromTo(make, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .2, ease: "power2.out" }, .12)
      .fromTo(make, { opacity: 1 }, { opacity: 0, duration: .06, immediateRender: false }, .5)
    // the group flows into the arch: clip and move together; the parallax settles to rest so the arch shows the plain composite
      .fromTo(g, { x: 0, y: 0, scale: 1, clipPath: "inset(0px 0px 0px 0px round 0px 0px 0px 0px)" },
                 { x: () => geo().x, y: () => geo().y, scale: () => geo().s, clipPath: end, duration: .32, ease: "power2.inOut", immediateRender: false }, .58)
      .fromTo(room, { scale: A_SCALE, yPercent: -.55 }, { scale: 1, yPercent: 0, duration: .32, ease: "power2.inOut", immediateRender: false }, .58)
      .fromTo(woman, { scale: WOMAN_SCALE }, { scale: 1, duration: .32, ease: "power2.inOut", immediateRender: false }, .58)
    // hand-over: G has landed exactly on the slot; the real arch (same composite, 2:3 crop) takes its place
      .set(g, { visibility: "hidden", immediateRender: false }, .9)
      .set(still, { visibility: "visible", immediateRender: false }, .9)
    // the outline of the arch, then the text on the left
      .set(slot, { "--v": "hidden", "--o": 0 }, 0)
      .set(slot, { "--v": "visible" }, .9)
      .fromTo(slot, { "--o": 0 }, { "--o": 1, duration: .06, immediateRender: false }, .9)
      .fromTo(kids, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .1, stagger: .015, ease: "power2.out" }, .85);
  }

  /* ---------- 01 hero, phones: no pin ---------- */
  function heroPhone() {
    const slot = $('[data-scene="gia-hero"] .find__arch');
    const img = slot && $(".gia-hero__still", slot);
    if (!img) return;
    const R = () => slot.getBoundingClientRect().width / 2;
    gsap.set(img, { borderRadius: 0 });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: slot, start: "top 95%", end: "top 25%", scrub: .6, invalidateOnRefresh: true },
      defaults: { ease: "none" },
    });
    tl.fromTo(img, { clipPath: "inset(0px round 0px 0px 0px 0px)", scale: 1.3 }, { clipPath: () => `inset(0px round ${R()}px ${R()}px 0px 0px)`, scale: 1, duration: 1, ease: "power2.out" }, 0)
      .fromTo(slot, { "--o": 0 }, { "--o": 1, duration: .4 }, .6);
    return () => gsap.set(img, { clearProps: "all" });
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    doc.classList.add("has-scenes");
    heroScene();
    doc.classList.remove("scenes-pending");
    ScrollTrigger.refresh();
    return () => doc.classList.remove("has-scenes");
  });
  mm.add("(max-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const undo = heroPhone();
    ScrollTrigger.refresh();
    return undo;
  });
  doc.classList.remove("scenes-pending");

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
