/* ==========================================================
   Hero scene (home page)
   p = 0 … 1 over the pinned distance. The sky stays still, the
   valley grows and sinks, the girl settles a little, the word
   rises from behind the valley and stands behind her. Then the
   shade and the copy arrive.
   ========================================================== */
(() => {
  "use strict";

  const hero = document.querySelector("[data-hero]");
  if (!hero) return;

  const doc = document.documentElement;
  const stage = hero.querySelector(".hero__stage");
  const get = (name) => hero.querySelector(`[data-layer="${name}"]`);
  const sky = get("sky"), valley = get("valley"), girl = get("girl"), wordLayer = get("word");
  const word = hero.querySelector(".hero__word-inner");
  const shade = hero.querySelector(".hero__shade");
  const cue = hero.querySelector(".hero__cue");
  const copy = [...hero.querySelectorAll("[data-copy]")];
  if (!stage || !sky || !valley || !girl || !wordLayer || !word) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const easeInOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  function render(p) {
    const d = easeInOut(seg(p, 0, .9));
    const rise = easeOut(seg(p, .04, .8));

    sky.style.transform = "none";
    wordLayer.style.transform = "none";
    valley.style.transform = `translate3d(0, ${lerp(0, 3.5, d)}%, 0) scale(${lerp(1, 1.11, d)})`;
    girl.style.transform = `translate3d(0, ${lerp(0, 1.5, d)}%, 0)`;
    word.style.transform = `translate3d(0, ${lerp(wordFrom, 0, rise)}%, 0)`;

    if (shade) shade.style.opacity = smooth(seg(p, .72, .92)).toFixed(3);
    const step = copy.length > 1 ? .08 / (copy.length - 1) : 0;   // the last block lands at p = 1
    copy.forEach((el, i) => {
      const t = easeOut(seg(p, .76 + i * step, .92 + i * step));
      el.style.opacity = t.toFixed(3);
      el.style.transform = `translate3d(0, ${lerp(24, 0, t)}px, 0)`;
    });
    if (cue) cue.style.opacity = (1 - smooth(seg(p, 0, .08))).toFixed(3);
  }

  function renderFinal() {
    [sky, wordLayer, valley, girl, word, ...copy].forEach((el) => { el.style.transform = ""; el.style.opacity = ""; });
    if (shade) shade.style.opacity = "";
  }

  let target = 0, current = 0, raf = 0, active = false, wordFrom = 175;

  function readVars() {
    const v = parseFloat(getComputedStyle(doc).getPropertyValue("--word-from"));
    wordFrom = Number.isFinite(v) ? v : 175;
  }
  function measure() {
    const travel = hero.offsetHeight - stage.offsetHeight;
    target = travel > 0 ? clamp(-hero.getBoundingClientRect().top / travel) : 1;
  }

  /* Lenis already smooths the scroll, so with it the scene follows
     the scroll directly. Without it, a calm catch-up softens jumps. */
  const smoothed = () => !(window.Glonari && window.Glonari.lenis);

  function tick() {
    current = smoothed() ? current + (target - current) * .09 : target;
    if (Math.abs(target - current) < .0004) current = target;
    render(current);
    raf = current === target ? 0 : requestAnimationFrame(tick);
  }
  function onScroll() {
    if (!active) return;
    measure();
    if (!raf) raf = requestAnimationFrame(tick);
  }
  function setMode() {
    active = !reduce.matches;
    hero.classList.toggle("is-static", !active);
    if (!active) {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      renderFinal();
      return;
    }
    readVars();
    measure();
    current = target;
    render(current);
  }

  doc.classList.add("js");
  document.body.classList.remove("no-js");

  /* ---------- Video mode (desktop, motion allowed) ----------
     0–70 %  the descent video follows the scroll (currentTime, no autoplay)
     70–78 % the video cross-fades to the still sky + valley
     78–88 % the word appears behind the woman, the woman rises from below
     88–100 % shade, title, paragraphs, buttons                              */
  const videoQuery = window.matchMedia("(min-width: 769px) and (min-aspect-ratio: 1/1) and (prefers-reduced-motion: no-preference)");
  if (videoQuery.matches && window.gsap && window.ScrollTrigger) {
    initVideoMode();
    return;
  }
  doc.classList.remove("hero-video");

  function initVideoMode() {
    gsap.registerPlugin(ScrollTrigger);
    const FPS = 24;
    const box = hero.querySelector(".hero__video");
    const still = hero.querySelector(".hero__still");
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.setAttribute("aria-hidden", "true");
    video.src = "assets/images/home-hero-descent-scrub.mp4";
    box.appendChild(video);

    /* Windows wider than 2:1 crop the frame from the top, so the woman's hair would reach the menu:
       drop her layer just enough to keep the hair 16px under the header (limited by the spare image below). */
    const HEAD_TOP = .0915;   // top of her hair, share of the frame height (girl layer alpha)
    let shift = 0;
    function measureShift() {
      shift = 0;
      if (window.innerWidth / window.innerHeight <= 2) return;
      const frame = hero.querySelector(".hero__frame").getBoundingClientRect();
      const st = stage.getBoundingClientRect();
      const header = parseFloat(getComputedStyle(doc).getPropertyValue("--header-h")) || 76;
      const headTop = frame.top - st.top + HEAD_TOP * frame.height;
      const spare = Math.max(0, frame.bottom - st.bottom);
      shift = Math.min(spare, Math.max(0, header + 16 - headTop));
    }
    let frames = 0, lastFrame = -1;
    video.addEventListener("loadedmetadata", () => { frames = Math.round(video.duration * FPS); render(state.p); });

    function render(p) {
      if (frames) {
        const f = Math.round(seg(p, 0, .70) * (frames - 1));
        if (f !== lastFrame) { lastFrame = f; video.currentTime = (f + .5) / FPS; }
      }
      still.style.opacity = smooth(seg(p, .70, .78)).toFixed(3);
      wordLayer.style.opacity = smooth(seg(p, .78, .88)).toFixed(3);
      girl.style.opacity = "1";
      girl.style.transform = `translate3d(0, calc(${lerp(100, 0, easeOut(seg(p, .78, .88))).toFixed(3)}% + ${shift.toFixed(1)}px), 0)`;
      sky.style.transform = valley.style.transform = wordLayer.style.transform = word.style.transform = "none";
      if (shade) shade.style.opacity = smooth(seg(p, .86, 1)).toFixed(3);
      const q = seg(p, .88, 1);
      const n = copy.length, stagger = n > 1 ? .45 / (n - 1) : 0;
      copy.forEach((el, i) => {
        const t = easeOut(seg(q, i * stagger, i * stagger + .55));
        el.style.opacity = t.toFixed(3);
        el.style.transform = `translate3d(0, ${lerp(24, 0, t)}px, 0)`;
      });
      if (cue) cue.style.opacity = (1 - smooth(seg(p, 0, .03))).toFixed(3);
    }

    const state = { p: 0 };
    gsap.to(state, {
      p: 1,
      ease: "none",
      onUpdate: () => render(state.p),
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true }
    });
    measureShift();
    ScrollTrigger.addEventListener("refresh", () => { measureShift(); render(state.p); });
    render(0);
    videoQuery.addEventListener("change", () => location.reload());
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => { readVars(); onScroll(); }, { passive: true });
  if (reduce.addEventListener) reduce.addEventListener("change", setMode);
  setMode();
})();
