/* ==========================================================
   Glonari Homes — Find Your Home
   Pinned scenes (motion allowed):
     >=769px  .has-scenes : 01 hero, 02B "Your personal property advisor", 06 "What happens next?"
     >=1024px .is-pinned  : 03 the first questions (read-only); below 1024px the questions are a plain list.
                            Four pins on the page (owner, 2026-11-25: the arch of 03 stays).
   Light scrubbed accents (no pin, any width, motion allowed): the map
   route, the dark band's rule, the cost screen's house/line/underline.
   Scrubbed timelines use fromTo only (from breaks on refresh).
   ========================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const doc = document.documentElement;

  if (!window.gsap || !window.ScrollTrigger) { doc.classList.remove("scenes-pending"); return; }
  gsap.registerPlugin(ScrollTrigger);

  const scrubTo = (trigger) => ({ trigger, start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true });
  const st = (trigger, start, end) => ({ trigger, start, end, scrub: .6, invalidateOnRefresh: true });

  /* ---------- 01 hero ---------- */
  function heroScene() {
    const scene = $('[data-scene="find-hero"]');
    if (!scene) return;
    // two effects: the home settles onto the street, then one slow push-in of the street
    gsap.timeline({ scrollTrigger: scrubTo(scene), defaults: { ease: "none" } })
      .fromTo($(".find-hero__cue", scene), { opacity: 1 }, { opacity: 0, duration: .06 }, 0)
      .fromTo($(".find-hero__home", scene), { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: .36, ease: "power1.out" }, .04)
      .fromTo($(".find-hero__bg", scene), { scale: 1 }, { scale: 1.04, duration: .5, immediateRender: false }, .5);
  }

  /* ---------- 06 what happens next ---------- */
  function nextScene() {
    const scene = $('[data-scene="find-next"]');
    if (!scene) return;
    gsap.timeline({ scrollTrigger: scrubTo(scene), defaults: { ease: "none" } })
      .fromTo($(".find-next__bg", scene), { scale: 1 }, { scale: 1.02, duration: 1 }, 0)
      .fromTo($(".find-next__people", scene), { scale: 1 }, { scale: 1.05, duration: 1 }, 0)
      // the panel's lines come up into the paper panel (the panel itself stays: no empty strip under the photo)
      .fromTo($(".find-next__panel-in", scene), { opacity: 0, y: 48 }, { opacity: 1, y: 0, duration: .22, ease: "power2.out" }, .72);
  }


  /* ---------- 02B your personal property advisor ----------
     One pin (owner chose prototype B with the lines of C, 2026-11-26). .03-.20 the full photo is clipped (clip-path inset) and scaled (transform)
     into the scene's photo card, the rest is dark at once; .05-.18 the gold plan is drawn meanwhile, .20-.29 its points; .10-.22 headline and paragraphs
     leave upwards (before the card reaches them, so the face is never covered); .20-.34 the scene arrives, the photo card's own wrapper fades in over
     the woman (listing); from .46 four slides, chosen by scroll position or by the arrows. The colour frame ("What it could become.") comes up
     with the scroll progress inside each slide (see setColour). */
  function advScene() {
    const scene = $('[data-scene="find-adv"]');
    if (!scene) return () => {};
    const stage = $("[data-stage]", scene);
    const photoBox = $(".find-adv-photo", scene), img = $("img", photoBox), intro = $("[data-intro]", scene);
    const map = $(".find-adv-map", scene), paths = $$("svg path", map), pts = $$(".find-adv-pt", map);
    const slides = $$("[data-slide]", scene);
    const rings = $$("[data-ring]", scene);
    const arcs = $$("[data-arc]", scene);
    const count = $("[data-count]", scene), prev = $("[data-prev]", scene), next = $("[data-next]", scene);
    const N = slides.length, START = .46;
    const H = () => window.innerHeight;
    let idx = -1;
    paths.forEach((p) => { p.setAttribute("pathLength", "1"); p.style.strokeDasharray = "1"; p.style.strokeDashoffset = "1"; });

    // geometry, re-measured on every refresh: where the full-bleed photo has to end up (the scene's photo card, find.css .find-adv-w--ph)
    const g = {};
    const measure = () => {
      const r = stage.getBoundingClientRect(), W = r.width, Hh = r.height;
      const L = .334 * W, w = .249 * W, T = .25 * Hh, h = .57 * Hh;
      const iw = Math.max(W, Hh * 16 / 9), ox = (W - iw) / 2;
      const s = Math.max(h / Hh, w / W), ef = ox + .785 * iw;   // .785 = the woman's centre across the photo
      Object.assign(g, { W, Hh, L, w, T, h, s, tx: Math.min(Math.max(L + w / 2 - s * ef, L + w - s * W), L), ty: T + (h - s * Hh) / 2 });
    };
    measure();
    ScrollTrigger.addEventListener("refreshInit", measure);

    const tl = gsap.timeline({ scrollTrigger: scrubTo(scene), defaults: { ease: "none" } });
    const proxy = { u: 0 };
    const apply = () => {
      const q = proxy.u;
      photoBox.style.clipPath = `inset(${q * g.T}px ${q * (g.W - g.L - g.w)}px ${q * (g.Hh - g.T - g.h)}px ${q * g.L}px)`;
      gsap.set(img, { x: q * g.tx, y: q * g.ty, scale: 1 + (g.s - 1) * q });
      photoBox.style.setProperty("--sh", String(Math.max(0, 1 - q * 1.6)));
    };
    tl.fromTo(proxy, { u: 0 }, { u: 1, duration: .17, ease: "power1.inOut", onUpdate: apply }, .03)
      .fromTo(map, { opacity: 0 }, { opacity: 1, duration: .01 }, .05);
    paths.forEach((p, i) => tl.fromTo(p, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .065, ease: "power1.inOut" }, .05 + i * .022));
    pts.forEach((p, i) => tl.fromTo(p, { opacity: 0 }, { opacity: 1, duration: .03, ease: "power1.out" }, .2 + i * .03));
    tl.fromTo(intro, { y: 0 }, { y: () => -H() * .5, duration: .12, ease: "power1.inOut" }, .1)
      .fromTo(intro, { opacity: 1 }, { opacity: 0, duration: .06 }, .1)
      .fromTo($$('[data-enter="card"]', scene), { y: () => H() * .85 }, { y: 0, duration: .14, ease: "power3.out" }, .2)
      .fromTo($$('[data-enter="photo"]', scene), { opacity: 0 }, { opacity: 1, duration: .1, ease: "power1.inOut" }, .24)
      .fromTo($$('[data-enter="left"]', scene), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .1, ease: "power2.out" }, .3)
      .fromTo(photoBox, { opacity: 1 }, { opacity: 0, duration: .005 }, .35)   // the card's wrapper now covers the woman completely
      .fromTo(paths, { opacity: 1 }, { opacity: .5, duration: .06 }, .38)
      .to({}, { duration: .01 }, .99);

    /* colour by scroll progress inside the slide: grey until 30% of the slide's segment, colour is complete at 50% and stays to the end of the segment */
    const smooth = (x) => { x = Math.min(Math.max(x, 0), 1); return x * x * (3 - 2 * x); };
    let lastC = -1;
    const setColour = (c) => { c = Math.round(c * 1000) / 1000; if (c !== lastC) { lastC = c; stage.style.setProperty("--c", c); } };
    const show = (i) => {
      if (i === idx) return;
      idx = i;
      slides.forEach((li, k) => { li.classList.toggle("is-on", k === i); li.classList.toggle("is-past", k < i); li.setAttribute("aria-hidden", k === i ? "false" : "true"); });
      arcs.forEach((a) => { a.style.strokeDashoffset = (+a.dataset.arc === i) ? 100 * (1 - +a.dataset.frac) : 100; });
      rings.forEach((m) => m.classList.toggle("is-on", m.dataset.ring.split(",").includes(String(i))));
      if (count) count.textContent = `${i + 1} | ${N}`;
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === N - 1;
    };
    const trig = ScrollTrigger.create({
      trigger: scene, start: "top top", end: "bottom bottom", invalidateOnRefresh: true,
      onUpdate: (self) => {
        const p = self.progress;
        const f = Math.min(Math.max((p - START) / (1 - START), 0), .9999) * N;   // 0..N across the four slides
        show(Math.min(N - 1, Math.floor(f)));
        setColour(p < START ? 0 : smooth((f - Math.floor(f) - .3) / .2));
      },
    });
    /* arrows: the slide opens grey (u = .12), 0.5 s later the page scrolls on to u = .7 where the colour is complete */
    let goTok = 0;
    const yAt = (i, u) => trig.start + (START + ((Math.min(Math.max(i, 0), N - 1) + u) / N) * (1 - START)) * (trig.end - trig.start);
    const lenis = () => window.Glonari && window.Glonari.lenis;
    const scrollTo = (y, d, done) => { const l = lenis(); if (l) l.scrollTo(y, { duration: d, onComplete: done }); else { window.scrollTo({ top: y, behavior: "smooth" }); setTimeout(done, d * 1000); } };
    const go = (i) => {
      const tok = ++goTok;
      scrollTo(yAt(i, .12), 1.1, () => setTimeout(() => { if (tok === goTok) scrollTo(yAt(i, .7), 1); }, 500));
    };
    const cancelGo = () => { goTok++; };
    window.addEventListener("wheel", cancelGo, { passive: true });
    window.addEventListener("touchmove", cancelGo, { passive: true });
    const onPrev = () => go(idx - 1), onNext = () => go(idx + 1);
    const onKey = (e) => { if (e.key === "ArrowRight") go(idx + 1); else if (e.key === "ArrowLeft") go(idx - 1); };
    prev && prev.addEventListener("click", onPrev);
    next && next.addEventListener("click", onNext);
    scene.addEventListener("keydown", onKey);
    show(0);
    return () => {
      prev && prev.removeEventListener("click", onPrev);
      next && next.removeEventListener("click", onNext);
      scene.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", cancelGo); window.removeEventListener("touchmove", cancelGo); goTok++;
      stage.style.removeProperty("--c");
      ScrollTrigger.removeEventListener("refreshInit", measure);
      photoBox.style.clipPath = ""; photoBox.style.removeProperty("--sh");
      paths.forEach((p) => { p.removeAttribute("pathLength"); p.style.strokeDasharray = ""; p.style.strokeDashoffset = ""; });
      slides.forEach((li) => { li.classList.remove("is-on", "is-past"); li.removeAttribute("aria-hidden"); });
      arcs.forEach((a) => { a.style.strokeDashoffset = ""; });
      rings.forEach((m) => m.classList.remove("is-on"));
      trig.kill(); tl.kill();
      gsap.set([img, photoBox, intro, map, ...paths, ...pts, ...$$("[data-enter]", scene)], { clearProps: "all" });
    };
  }

  /* ---------- 03 the first questions (>=1024px) ---------- */
  let qScrollTo = null;
  function questionsScene() {
    const scene = $('[data-scene="find-q"]');
    if (!scene) return () => {};
    const items = $$(".find-q__item", scene);
    const dotsBox = $(".find-q__dots", scene);
    const N = items.length;
    const TEXT = (k) => [$(".find-q__no", items[k]), $(".find-q__q", items[k])];
    const IMG = (k) => $(".find-q__fig img", items[k]);
    const START = .5, STEP = 1, TR = .5;                  // question k (k>=1) starts changing at START + (k-1)*STEP
    const startOf = (k) => START + (k - 1) * STEP;
    const END = startOf(N - 1) + TR + .6;

    scene.classList.add("is-pinned");
    const dots = items.map((_, k) => {
      const b = document.createElement("button");
      b.type = "button"; b.className = "find-q__dot"; b.textContent = String(k + 1).padStart(2, "0");
      b.setAttribute("aria-label", `Question ${k + 1}`);
      b.addEventListener("click", () => qScrollTo && qScrollTo(k));
      dotsBox.appendChild(b);
      return b;
    });
    const mark = (n) => dots.forEach((d, i) => d.setAttribute("aria-current", i === n ? "true" : "false"));
    mark(0);

    const tl = gsap.timeline({ defaults: { ease: "none" } });
    for (let k = 1; k < N; k++) {
      const t = startOf(k);
      // the old question leaves upward, the new one comes up from below; the next photo opens from the base of the arch
      tl.fromTo(TEXT(k - 1), { opacity: 1, y: 0 }, { opacity: 0, y: -26, duration: .3, ease: "power1.in" }, t)
        .fromTo(TEXT(k), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .34, ease: "power2.out" }, t + .2)
        .fromTo(IMG(k), { clipPath: "inset(100% 0% 0% 0%)", scale: 1.05 }, { clipPath: "inset(0% 0% 0% 0%)", scale: 1, duration: TR, ease: "power2.inOut" }, t);
    }
    tl.to({}, { duration: .6 }, END - .6);

    const idxAt = (p) => { let n = 0; for (let k = 1; k < N; k++) if (p >= startOf(k) + TR / 2) n = k; return n; };
    const trig = ScrollTrigger.create({
      trigger: scene, start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true, animation: tl,
      onUpdate: (self) => mark(idxAt(self.progress * END)),
    });
    qScrollTo = (k) => {
      const t = k === 0 ? .15 : startOf(k) + TR + .1;
      const y = trig.start + (t / END) * (trig.end - trig.start);
      const lenis = window.Glonari && window.Glonari.lenis;
      if (lenis) lenis.scrollTo(y, { duration: 1.2 }); else window.scrollTo({ top: y, behavior: "smooth" });
    };
    return () => {
      qScrollTo = null;
      scene.classList.remove("is-pinned");
      trig.kill(); tl.kill();
      gsap.set($$(".find-q__no, .find-q__q, .find-q__fig img", scene), { clearProps: "all" });
      dotsBox.textContent = "";
    };
  }

  /* ---------- map pins: placed on the route by JS (static map has only the line) ---------- */
  function buildPins() {
    const map = $(".find-map");
    const path = $(".find-map__path");
    if (!map || !path) return [];
    const len = path.getTotalLength();
    const pts = [0, .2, .4, .6, .8, 1];
    return pts.map((t) => {
      const p = path.getPointAtLength(len * t);
      const pin = document.createElement("span");
      pin.className = "find-map__pin";
      pin.style.left = (p.x / 1200 * 100) + "%";
      pin.style.top = (p.y / 560 * 100) + "%";
      map.appendChild(pin);
      return pin;
    });
  }
  const pins = buildPins();

  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    doc.classList.add("has-scenes");
    heroScene();
    const advOff = advScene();
    nextScene();
    doc.classList.remove("scenes-pending");
    ScrollTrigger.refresh();
    return () => { advOff(); doc.classList.remove("has-scenes"); };
  });

  const mmQ = gsap.matchMedia();
  mmQ.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const undo = questionsScene();
    ScrollTrigger.refresh();
    return undo;
  });
  doc.classList.remove("scenes-pending");

  /* ---------- light accents ---------- */
  const mmLight = gsap.matchMedia();
  mmLight.add("(prefers-reduced-motion: no-preference)", () => {
    // 02: the gold route is drawn, the rings appear as it reaches them
    const map = $(".find-map");
    if (map) {
      const tl = gsap.timeline({ scrollTrigger: st(map, "top 78%", "bottom 52%"), defaults: { ease: "none" } });
      tl.fromTo($(".find-map__path"), { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1 }, 0);
      pins.forEach((p, i) => tl.fromTo(p, { opacity: 0, scale: .4 }, { opacity: 1, scale: 1, duration: .08 }, i * .2));
    }
    // 04: the gold rule between the heading and the statements is drawn
    const rule = $(".find-opt__rule");
    if (rule) gsap.fromTo(rule, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st(rule, "top 90%", "top 55%") });
    // 05: the home rises a little, the ground line is drawn, "estimated" gets its underline
    const house = $(".find-cost__house img");
    if (house) gsap.fromTo(house, { y: 48 }, { y: 0, ease: "none", scrollTrigger: st($(".find-cost__house"), "top 95%", "bottom 75%") });
    const ground = $(".find-cost__ground");
    if (ground) gsap.fromTo(ground, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: st(ground, "top 92%", "top 70%") });
    const u = $(".find-cost__u");
    if (u) gsap.fromTo(u, { "--u": 0 }, { "--u": 1, ease: "none", scrollTrigger: st(u, "top 82%", "top 52%") });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();

