/* ==========================================================
   Glonari Homes — Gia
   One pinned scene (motion allowed, >=769px, .has-scenes): 01 hero, ~240svh. Progress 0..1:
     0 - .12   the empty room (layer A) alone: slow parallax, scale 1 -> 1.04
     .12 - .32 Gia (layer a1, a cut-out on the same 2560x1600 canvas) comes in: opacity 0 -> 1, lift 24px, scale .985 -> 1,
               together with the line "Gia makes it easier." (desktop only); then A and Gia move at different speeds (A scale 1.04, Gia 1.06: ~2.8% of the frame)
     .52 - .56 a short pause on the full composition; the line leaves
     .56 - .90 photo B (inside the shared .find__arch slot) takes the place of Gia (a1 fades out in the same instant), then flows down and right (x / y / scale)
               while its shape turns from a rectangle into the arch (clip-path inset + round); A dissolves into the paper
     .82 - 1   the arch outline and the text come in on the left
   <=768px, motion allowed: no pin; the photo flows into the arch while the arch scrolls into view.
   Reduced motion / no JS: the static final layout (CSS only; A, a1 and the line are not shown).
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
  // Gia's frame on the 2560x1600 canvas: the alpha bounding box of the cut-out (418,404 - 1015,1599) plus 60px of room, as a 2:3 rectangle
  const CANVAS = { w: 2560, h: 1600 };
  const FRAME = { x: 277.8, y: 344, w: 877.3, h: 1316 };
  const A_SCALE = 1.04, WOMAN_SCALE = 1.06;       // end-of-parallax scales (the pause state)
  // Fallback without clip-path (transform + opacity only): add ?lite to the address, or the class "gia-lite" to <html>.
  // Photo B then travels as a plain rectangle and the arch-shaped still in the slot fades in over it as it lands
  // (a cross-fade instead of the shape morph).
  const LITE = /[?&]lite\b/.test(location.search) || doc.classList.contains("gia-lite");

  function heroScene() {
    const scene = $('[data-scene="gia-hero"]');
    if (!scene) return;
    const stage = $(".scene__stage", scene);
    const a = $(".gia-hero__a", scene), aImg = $("img", a);
    const a1 = $(".gia-hero__a1", scene), woman = $("img", a1);
    const make = $("[data-make]", scene);
    const slot = $(".find__arch", scene), b = $(".gia-hero__b", scene), still = $(".gia-hero__still", scene);
    const kids = $$("[data-in]", scene);
    if (LITE) doc.classList.add("gia-lite");

    // photo B starts as a 2:3 rectangle exactly over Gia as she stands in the PAUSE state (layout maths, independent of the playhead)
    const frame = () => {
      const st = stage.getBoundingClientRect();
      const top = a1.offsetTop, wh = st.height - top;             // the layer box: full width, header to bottom
      const bw = st.width, bh = wh * 1.08, bTop = top - wh * .04;  // the image box inside it (top -4%, height 108%)
      const k = Math.max(bw / CANVAS.w, bh / CANVAS.h);            // object-fit: cover
      const ox = (bw - CANVAS.w * k) / 2, oy = (bh - CANVAS.h * k) / 2;
      let fx = ox + FRAME.x * k, fy = oy + FRAME.y * k, fw = FRAME.w * k, fh = FRAME.h * k;
      fx = bw / 2 + (fx - bw / 2) * WOMAN_SCALE; fy = bh + (fy - bh) * WOMAN_SCALE;   // scale about the bottom centre
      fw *= WOMAN_SCALE; fh *= WOMAN_SCALE;
      return { cx: fx + fw / 2, cy: bTop + fy + fh / 2, w: fw };
    };
    const slotBox = () => {
      const s = stage.getBoundingClientRect(), r = slot.getBoundingClientRect();
      return { cx: r.left - s.left + r.width / 2, cy: r.top - s.top + r.height / 2, w: r.width };
    };
    const R = () => slot.getBoundingClientRect().width / 2;
    const clip = (r) => `inset(0px round ${r}px ${r}px 0px 0px)`;

    const tl = gsap.timeline({
      scrollTrigger: { trigger: scene, start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true },
      defaults: { ease: "none" },
    });
    // the empty room: slow parallax from the first pixel of scroll
    tl.fromTo(aImg, { scale: 1, yPercent: 0 }, { scale: A_SCALE, yPercent: -.55, duration: .52 }, 0)
    // Gia comes in, then moves a little faster than the room
      .fromTo(a1, { opacity: 0, y: 24, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .2, ease: "power2.out" }, .12)
      .fromTo(woman, { scale: 1 + (A_SCALE - 1) * .12 / .52 }, { scale: WOMAN_SCALE, duration: .4 }, .12)
    // the line: with Gia, gone before photo B starts to move
      .fromTo(make, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .2, ease: "power2.out" }, .12)
      .fromTo(make, { opacity: 1 }, { opacity: 0, duration: .06, immediateRender: false }, .5)
    // photo B takes Gia's place (a1 fades in the same instant), then flows down and right to the arch slot
      .fromTo(a1, { opacity: 1 }, { opacity: 0, duration: .04, immediateRender: false }, .56)
      .fromTo(b, { opacity: 0 }, { opacity: 1, duration: .04, immediateRender: false }, .56)
      .fromTo(b, { x: () => frame().cx - slotBox().cx, y: () => frame().cy - slotBox().cy, scale: () => frame().w / slotBox().w },
                 { x: 0, y: 0, scale: 1, duration: .34, ease: "power2.inOut", immediateRender: false }, .56)
      .add(LITE ? gsap.timeline() : gsap.fromTo(b, { clipPath: clip(0) }, { clipPath: () => clip(R()), duration: .3, ease: "power2.inOut", immediateRender: false }), .58)
    // the room dissolves into the paper
      .fromTo(a, { opacity: 1 }, { opacity: 0, duration: .24, ease: "power1.inOut", immediateRender: false }, .62)
    // lite only: the arch-shaped still takes over from the rectangle, no clip-path
      .add(LITE ? gsap.timeline().fromTo(still, { opacity: 0 }, { opacity: 1, duration: .05, immediateRender: false }, 0).fromTo(b, { opacity: 1 }, { opacity: 0, duration: .05, immediateRender: false }, 0) : gsap.timeline(), .86)
    // the outline of the arch and the text
      .fromTo(slot, { "--o": 0 }, { "--o": 1, duration: .12 }, .88)
      .fromTo(kids, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: .12, stagger: .02, ease: "power2.out" }, .81);
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
