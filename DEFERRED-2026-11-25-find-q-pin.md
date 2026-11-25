# Find Your Home 03 pin — RESTORED 2026-11-25

The pin was taken out by mistake of reading the owner's earlier instruction and put back the same day (owner: the arch stays, a fourth pin on Find is allowed). The code is in `docs/js/find.js` again (`questionsScene`, `mmQ`), unchanged. This file keeps the copy that was set aside.

```js
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


  const mmQ = gsap.matchMedia();
  mmQ.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const undo = questionsScene();
    ScrollTrigger.refresh();
    return undo;
  });
```
