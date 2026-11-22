/* ==========================================================
   Glonari Homes — home page scenes
   Each scene's CSS default is its final, static layout (phones,
   reduced motion, no JS). On wide screens with motion allowed,
   .has-scenes pins the stage and the timelines below play with
   the scroll, forwards and backwards.
   ========================================================== */
(() => {
  "use strict";

  const doc = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Gia: the conversation plays once when it comes into view ---------- */
  const chat = $("[data-chat]");
  if (chat) {
    const msgs = $$("[data-msg]", chat);
    const typing = $("[data-typing]", chat);
    const showAll = () => msgs.forEach((m) => m.classList.add("is-shown"));
    const play = () => {
      if (reduce.matches) return showAll();
      msgs[0].classList.add("is-shown");
      setTimeout(() => typing.classList.add("is-on"), 700);
      setTimeout(() => { typing.classList.remove("is-on"); msgs[1].classList.add("is-shown"); }, 2300);
    };
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((en) => {
        if (en[0].isIntersecting) { io.disconnect(); play(); }
      }, { threshold: .45 });
      io.observe(chat);
    } else showAll();
  }

  /* ---------- 4. Find your home: the arch video plays from the first frame every time the arch comes into view ----------
     No loop. At 40% visible: rewind and play once to the end (it rests on the last frame while the arch stays
     in view; it is not restarted). When the arch leaves the viewport completely: pause and rewind, so the next
     visit starts again. Reduced motion, or a play() the browser refuses: the poster stays, silently. */
  const findVideo = $("[data-find-video]");
  const findArch = $("[data-find-arch]");
  if (findVideo && findArch && "IntersectionObserver" in window) {
    let playing = false;                       // true from the moment we start until the arch leaves the view
    const rewind = () => { try { findVideo.currentTime = 0; } catch (e) {} };
    const io = new IntersectionObserver((en) => {
      const e = en[en.length - 1];
      if (!e.isIntersecting) {
        if (playing) { playing = false; findVideo.pause(); rewind(); }
        return;
      }
      if (playing || e.intersectionRatio < .4 || reduce.matches) return;
      playing = true;
      rewind();
      const p = findVideo.play();
      if (p && p.catch) p.catch(() => {});
    }, { threshold: [0, .4] });
    io.observe(findArch);
  }
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const scrubTo = (trigger) => ({ trigger, start: "top top", end: "bottom bottom", scrub: .6, invalidateOnRefresh: true });

  /* ---------- 2. Why Glonari: a right-to-left wipe reveals the Glonari Home ----------
     The wipe container and its image counter-slide at the same rate, so the
     "after" photo never visibly moves — only the reveal edge sweeps across,
     right to left (same principle as the classic GSAP image-comparison wipe). */
  function problemScene() {
    const scene = $('[data-scene="problem"]');
    if (!scene) return;
    const wipe = $(".problem__wipe", scene);
    const wipeImg = $(".problem__wipe-in img", scene);
    const capBefore = $(".problem__cap--before", scene);
    const capAfter = $(".problem__cap--after", scene);

    gsap.timeline({ scrollTrigger: scrubTo(scene), defaults: { ease: "none" } })
      .fromTo(wipe, { xPercent: 100, x: 0 }, { xPercent: 0, duration: .6 }, 0)
      .fromTo(wipeImg, { xPercent: -100, x: 0 }, { xPercent: 0, duration: .6 }, 0)
      .fromTo(capBefore, { autoAlpha: 1 }, { autoAlpha: 0, duration: .22 }, 0)
      .fromTo(capAfter, { autoAlpha: 0 }, { autoAlpha: 1, duration: .24 }, .42)
      .to({}, { duration: .2 });
  }

  /* ---------- 3. The cost: the house rises, then one figure at a time rises from behind its roof, is read and sinks back ---------- */
  function econScene() {
    const scene = $('[data-scene="econ"]');
    if (!scene) return;
    const intro = $(".econ__intro", scene);
    const house = $(".econ__house", scene);
    const steps = $$(".econ__step", scene);

    const tl = gsap.timeline({ scrollTrigger: scrubTo(scene) });
    tl.fromTo(house, { yPercent: 30 }, { yPercent: 0, duration: 1, ease: "power2.out" }, 0)
      .fromTo(intro, { autoAlpha: 1, y: 0 }, { autoAlpha: 0, y: -40, duration: .6, ease: "power2.in" }, 1.2);

    const enter = (step, at) => {
      tl.fromTo(step, { autoAlpha: 0 }, { autoAlpha: 1, duration: .05 }, at)
        .fromTo($(".econ__num", step), { yPercent: 70, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: .8, ease: "power2.out" }, at)
        .fromTo($(".econ__label", step), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power2.out" }, at + .3);
    };
    const leave = (step, at) => {   // sinks back behind the roof and fades, as the next one is about to rise
      tl.fromTo($(".econ__num", step), { yPercent: 0, autoAlpha: 1 }, { yPercent: 70, autoAlpha: 0, duration: .6, ease: "power2.in", immediateRender: false }, at)
        .fromTo($(".econ__label", step), { autoAlpha: 1 }, { autoAlpha: 0, duration: .35, immediateRender: false }, at);
    };

    let t = 1.6;
    steps.forEach((step, i) => {
      enter(step, t);
      if (i < steps.length - 1) { leave(step, t + 1.5); t += 2.0; }
    });
    tl.to({}, { duration: 1 });
  }

  /* ---------- 7. CTA: the light softens to evening, the words arrive, light returns a little ---------- */
  function ctaScene() {
    const scene = $('[data-scene="cta"]');
    if (!scene) return;
    const dusk = $(".cta__img--dusk", scene);
    const veil = $(".cta__veil", scene);
    const copy = $(".cta__copy", scene).children;

    gsap.timeline({ scrollTrigger: scrubTo(scene) })
      .fromTo(dusk, { opacity: 0 }, { opacity: 1, duration: 1, ease: "sine.inOut" }, 0)
      .fromTo(veil, { opacity: .25 }, { opacity: 1, duration: 1, ease: "sine.inOut" }, 0)
      .fromTo($$(".cta__img", scene), { scale: 1.05 }, { scale: 1, duration: 2, ease: "none" }, 0)
      .fromTo(copy, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: .5, stagger: .12, ease: "power2.out" }, .5)
      .fromTo(dusk, { opacity: 1 }, { opacity: .55, duration: .8, ease: "sine.inOut", immediateRender: false }, 1.2);
  }

  const mm = gsap.matchMedia();
  mm.add("(min-width: 769px) and (prefers-reduced-motion: no-preference)", () => {
    doc.classList.add("has-scenes");
    problemScene();
    econScene();
    ctaScene();
    ScrollTrigger.refresh();
    return () => {
      doc.classList.remove("has-scenes");
    };
  });

  /* ---------- Light scrubbed accents (no pin, any width, motion allowed only) ---------- */
  const mmLight = gsap.matchMedia();
  mmLight.add("(prefers-reduced-motion: no-preference)", () => {
    const st = (trigger, start, end) => ({ trigger, start, end, scrub: .6, invalidateOnRefresh: true });

    // Why Glonari: the closing sentence lights word by word
    const sentence = $(".problem__statement");
    let original = null;
    if (sentence) {
      original = sentence.innerHTML;
      sentence.innerHTML = sentence.textContent.trim().split(" ").map((w) => `<span class="w">${w}</span>`).join(" ");
      gsap.fromTo($$(".w", sentence), { opacity: .16 }, { opacity: 1, ease: "none", stagger: .12, scrollTrigger: st(sentence, "top 88%", "top 38%") });
    }

    return () => { if (sentence && original !== null) sentence.innerHTML = original; };
  });

  // Images load lazily; re-measure once everything has its size.
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();
