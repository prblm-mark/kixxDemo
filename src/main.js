/**
 * main.js — Kixx Football Academy hero animation
 *
 * Nine-phase GSAP timeline that plays after all assets are preloaded:
 *   1. Headline words punch in        5. GROWTH outline rows fan out
 *   2. IT'S/ABOUT spread, NOT enters  6. GROWTH → REAL scramble + benefits
 *   3. Black wipe, colour inversion   7. Clear stage, video reveal
 *   4. IT'S/ABOUT exit, GROWTH enters 8. "THAT'S WHAT KIXX IS ABOUT"
 *                                     9. CTA form slides in
 *
 * Dependencies: GSAP 3 core + ScrollTrigger, ScrollSmoother,
 *               TextPlugin, ScrambleTextPlugin, SplitText (all via CDN)
 */

const loadStartTime = Date.now();

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, ScrambleTextPlugin, SplitText);

document.fonts.ready.then(() => {

  // ── DOM References ──────────────────────────────────────────────────

  const headlineWords      = document.querySelectorAll(".headline-word:not(#word-growth):not(#word-thats-what):not(#word-is-about)");
  const textNot            = document.getElementById("text-not");
  const wordIts            = document.getElementById("word-its");
  const wordAbout          = document.getElementById("word-about");
  const logo               = document.getElementById("logo");
  const wipePanel          = document.getElementById("wipe-panel");
  const wordThe            = document.getElementById("word-the");
  const wordScore          = document.getElementById("word-score");
  const wordGrowth         = document.getElementById("word-growth");
  const growthRows         = document.querySelectorAll("[data-growth-row]");
  const growthPhotoCycler  = document.getElementById("growth-photo-cycler");
  const growthPhotos       = growthPhotoCycler.querySelectorAll("img");
  const wordGrowthText     = wordGrowth.querySelector("[data-growth-text]");
  const benefitFriendships = document.getElementById("benefit-friendships");
  const benefitProgress    = document.getElementById("benefit-progress");
  const benefitConfidence  = document.getElementById("benefit-confidence");
  const wordThatsWhat      = document.getElementById("word-thats-what");
  const wordKixxClosing    = document.getElementById("word-kixx-closing");
  const wordIsAbout        = document.getElementById("word-is-about");
  const heroVideo          = document.getElementById("hero-video");
  const videoOverlay       = document.getElementById("video-overlay");
  const heroCta            = document.getElementById("hero-cta");
  const mainNav            = document.getElementById("main-nav");
  const ctaTitle           = document.getElementById("cta-title");
  const ctaSubtitle        = document.getElementById("cta-subtitle");
  const bookingForm        = document.getElementById("booking-form");
  const scrollIndicator    = document.getElementById("scroll-indicator");
  const socialProof        = document.getElementById("social-proof");
  const formTabs           = document.querySelectorAll(".booking-form__tab");

  // ── ScrollSmoother ──────────────────────────────────────────────────

  ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.5,
    effects: true,
  });

  // ── Layout Measurements ─────────────────────────────────────────────

  // Cycler children are all absolute-positioned so the container has no
  // intrinsic height — calculate it from the 3x3 grid cell aspect ratio.
  const cellWidth  = (window.innerWidth - 12) / 3;
  const cellHeight = (window.innerHeight - 12) / 3;
  gsap.set(growthPhotoCycler, {
    height: growthPhotoCycler.offsetWidth * cellHeight / cellWidth,
  });

  // Video starts at the same visual size as the cycler
  const videoStartScale = (growthPhotoCycler.offsetWidth * 1.4) / window.innerWidth;

  // ── Initial States ──────────────────────────────────────────────────
  // All animated elements start hidden / off-screen; GSAP reveals them.

  gsap.set(headlineWords,     { opacity: 0, scale: 5, color: "#000000" });
  gsap.set(textNot,           { opacity: 0, scale: 0.5, xPercent: -50, yPercent: -50 });
  /* logo lives inside #main-nav — slides in with the nav, no separate set needed */
  // Use GSAP's xPercent/yPercent for centering — survives transform changes and resize
  gsap.set(wordGrowth,        { opacity: 0, scale: 0, xPercent: -50, yPercent: -50 });
  gsap.set(growthRows,        { opacity: 0, y: 0, xPercent: -50, yPercent: -50 });
  gsap.set(growthPhotoCycler, { opacity: 0, scale: 0, xPercent: -50, yPercent: -50 });
  gsap.set("[data-growth-text]", { display: "inline-block" });
  gsap.set([benefitFriendships, benefitProgress, benefitConfidence], { opacity: 0, x: "-2em" });
  gsap.set([wordThatsWhat, wordIsAbout], { scale: 5 });
  gsap.set(wordKixxClosing,  { scale: 10, rotation: -12 });
  gsap.set(heroVideo,        { scale: videoStartScale, opacity: 0, transformOrigin: "center center" });
  gsap.set(mainNav,          { y: "-100%" });
  gsap.set(ctaTitle,         { scale: 3, opacity: 0, transformOrigin: "center center" });
  gsap.set(ctaSubtitle,      { y: 20, opacity: 0 });
  gsap.set(bookingForm,      { y: 30, opacity: 0 });
  gsap.set(scrollIndicator,  { opacity: 0 });
  gsap.set(socialProof,      { y: 20, opacity: 0 });

  // ── Master Timeline (paused — debug scrubber or loader triggers play) ─

  const tl = gsap.timeline({ paused: true });

  // ── Phase 1: Headline words punch in from scale 5 → 1 ──────────────

  tl.to(headlineWords, {
    opacity: 1, scale: 1,
    duration: 0.5, stagger: 0.08, ease: "back.out(2.5)",
  })
  // Switch to orange + blend mode so wipe inversion works in Phase 3
  .set(headlineWords, { color: "#FF7500", mixBlendMode: "difference" })

  // ── Phase 2: IT'S/ABOUT spread apart, NOT fades in between them ─────

  .to(wordIts,   { x: "-0.4em", duration: 0.6, ease: "expo.out" }, "+=0.1")
  .to(wordAbout, { x: "0.4em",  duration: 0.6, ease: "expo.out" }, "<")
  .set(textNot, { zIndex: 1 }, "<")
  .to(textNot, {
    opacity: 1, scale: 1, rotation: -12,
    x: () => {
      // NOT is centred in the parent span via left:50% + xPercent:-50.
      // The visual gap between IT'S and ABOUT is left of the span's
      // geometric centre because IT'S is narrower than ABOUT.
      // Nudge left by half the width difference to land in the gap.
      const diff = wordAbout.offsetWidth - wordIts.offsetWidth;
      return `${-(diff / 2)}px`;
    },
    duration: 0.6, ease: "expo.out",
  }, "<")

  // ── Phase 3: Black wipe + colour inversion via mix-blend-mode ───────

  .to(wipePanel, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.25")
  .to(textNot,   { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.in" }, "<+=0.2")
  // Close the IT'S/ABOUT gap (must use "0em" not bare 0 — unit must match Phase 2)
  .to(wordIts,   { x: "0em", duration: 0.4, ease: "power2.inOut" }, "<")
  .to(wordAbout, { x: "0em", duration: 0.4, ease: "power2.inOut" }, "<")
  .to([wordThe, wordScore], {
    opacity: 0, y: 60,
    duration: 0.3, stagger: 0.05, ease: "power2.in",
  }, "<-=0.05")

  // ── Phase 4: IT'S/ABOUT explode out, GROWTH scales in ──────────────

  .to(wordIts,    { opacity: 0, scale: 5, x: "-2em", duration: 0.25, ease: "power2.in" }, "+=0.1")
  .to(wordAbout,  { opacity: 0, scale: 5, x: "2em",  duration: 0.25, ease: "power2.in" }, "<")
  .to(wordGrowth, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(3)" }, "<+=0.1")

  // ── Phase 5: Outlined GROWTH rows fan outward from centre ───────────

  .addLabel("phase5", "-=0.4");

  // Each row's vertical offset is proportional to its data-growth-row index
  growthRows.forEach((row) => {
    const index   = parseInt(row.dataset.growthRow, 10);
    const yTarget = `${index * 0.8}em`;
    const delay   = (Math.abs(index) - 1) * 0.05;

    tl.to(row, {
      opacity: 1, y: yTarget,
      duration: 0.2, ease: "back.out(2)",
    }, `phase5+=${delay}`);
  });

  // ── Phase 5b: Photo cycler scales in while cycling through images ───

  const scaleDuration = 1.35;
  const cycleDuration = 1.7;

  tl.to(growthPhotoCycler, {
    opacity: 0.5, scale: 1.4,
    duration: scaleDuration, ease: "power2.out",
  }, "phase5-=0.45")

  // Image sequence: full pass through all photos, then partial replay
  // to land on the hero shot (DSC02398)
  .add((() => {
    const totalImages = growthPhotos.length;
    const finalIndex  = Array.from(growthPhotos).findIndex(
      img => img.src.includes("DSC02398.webp")
    );

    const sequence = [];
    for (let i = 0; i < totalImages; i++) sequence.push(i);
    for (let i = 0; i <= finalIndex; i++) sequence.push(i);

    const playhead = { frame: 0 };
    let currentFrame = -1;

    function updateFrame() {
      const stepIndex  = Math.min(Math.round(playhead.frame), sequence.length - 1);
      const imageIndex = sequence[stepIndex];
      if (imageIndex === currentFrame) return;
      growthPhotos.forEach((img, i) => {
        img.style.opacity = i === imageIndex ? 1 : 0;
      });
      currentFrame = imageIndex;
    }

    updateFrame();

    return gsap.to(playhead, {
      frame: sequence.length - 1,
      duration: cycleDuration, ease: "none", snap: 1,
      onUpdate: updateFrame,
    });
  })(), "<");

  // ── Phase 6a: GROWTH fill → outline stroke, outer rows exit ─────────

  tl.addLabel("phase6", "phase5+=0.3");

  // Solid fill fades to reveal stroke (use rgba not "transparent" to avoid hue shift)
  tl.set(wordGrowthText, { webkitTextStroke: "2px #FF7500" }, "phase6")
    .to(wordGrowthText, {
      color: "rgba(255, 117, 0, 0)",
      duration: 0.2, ease: "power2.inOut",
    }, "phase6");

  // Outermost rows (-2, +2) fade out
  const outerRows = document.querySelectorAll("[data-growth-row='-2'], [data-growth-row='2']");
  tl.to(outerRows, { opacity: 0, duration: 0.3, ease: "power2.in" }, "phase6");

  // ── Phase 6b: ScrambleText GROWTH → REAL on remaining rows ──────────

  const innerRowTexts = [
    document.querySelector("[data-growth-row='-1'] [data-growth-text]"),
    wordGrowthText,
    document.querySelector("[data-growth-row='1'] [data-growth-text]"),
  ];
  const innerRowWraps = [
    document.querySelector("[data-growth-row='-1']"),
    wordGrowth,
    document.querySelector("[data-growth-row='1']"),
  ];

  tl.to(innerRowTexts, {
    scrambleText: { text: "REAL", chars: "GROWTHEAL", speed: 0.4 },
    duration: 0.6, stagger: 0.03,
  }, "phase6+=0.15");

  // ── Phase 6.3: Rows slide left — benefit words travel with them ─────

  tl.addLabel("phase63", "phase6+=0.2")
    .to(innerRowWraps, {
      x: () => {
        // Measure live so it works on resize — shift rows left to centre "REAL + BENEFIT"
        const longestBenefit = Math.max(
          benefitFriendships.scrollWidth,
          benefitProgress.scrollWidth,
          benefitConfidence.scrollWidth,
        );
        return `${-(longestBenefit / 2)}px`;
      },
      duration: 0.7, ease: "expo.out", stagger: 0.06,
    }, "phase63")

  // ── Phase 6.4: Benefit words emerge from behind REAL ────────────────

    .addLabel("phase64", "phase63+=0.4")
    .to([benefitFriendships, benefitProgress, benefitConfidence], {
      opacity: 1, x: "0em",
      duration: 0.45, ease: "expo.out", stagger: 0.1,
    }, "phase64");

  // ── Phase 7: Clear the stage — REAL exits left, benefits exit right ─

  tl.addLabel("phase7", "phase64+=0.9")
    .to(innerRowTexts, {
      x: () => `${gsap.utils.random(-80, -140)}vw`,
      duration: 0.6, ease: "expo.in",
      stagger: { each: 0.08, from: "random" },
    }, "phase7")
    .to([benefitFriendships, benefitProgress, benefitConfidence], {
      x: () => `${gsap.utils.random(80, 140)}vw`,
      duration: 0.6, ease: "expo.in",
      stagger: { each: 0.08, from: "random" },
    }, "phase7")

  // ── Phase 7b: Cross-fade photo cycler → video, expand to full screen

    .call(() => { heroVideo.play().catch(() => {}); }, null, "phase7+=0.05")
    .to(growthPhotoCycler, { opacity: 0, duration: 0.2, ease: "power2.in" },  "phase7+=0.2")
    .to(heroVideo,         { opacity: 1, duration: 0.2, ease: "power2.in" },  "phase7+=0.2")
    .to(heroVideo,         { scale: 1,   duration: 0.7, ease: "expo.out" },   "phase7+=0.2")
    .to(videoOverlay,      { opacity: 1, duration: 0.5, ease: "power2.out" }, "phase7+=0.2");

  // ── Phase 8: "THAT'S WHAT KIXX IS ABOUT" punches in over video ──────

  tl.addLabel("phase8", "phase7+=0.4")
    .to(wordThatsWhat,   { opacity: 1, scale: 1, duration: 0.4,  ease: "expo.out" }, "phase8+=0.05")
    .to(wordIsAbout,     { opacity: 1, scale: 1, duration: 0.4,  ease: "expo.out" }, "phase8+=0.13")
    .to(wordKixxClosing, { opacity: 1, scale: 1, duration: 0.55, ease: "expo.out" }, "phase8+=0.22")

    // Phase 8 exit — words scatter
    .addLabel("phase8exit", "phase8+=0.9")
    .to(wordKixxClosing, { opacity: 0, duration: 0.4, ease: "power2.in" }, "phase8exit")
    .to(wordThatsWhat,   { y: "-120%", opacity: 0, duration: 0.5, ease: "expo.in" }, "phase8exit+=0.05")
    .to(wordIsAbout,     { y: "120%",  opacity: 0, duration: 0.5, ease: "expo.in" }, "phase8exit+=0.05");

  // ── Phase 9: CTA form + nav slide in ────────────────────────────────

  tl.addLabel("phase9", "phase8exit+=0.55")
    .to(mainNav,         { y: "0%",  duration: 0.55, ease: "power3.out" },           "phase9")
    .to(ctaTitle,        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, "phase9+=0.15")
    .to(bookingForm,     { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },     "phase9+=0.35")
    .to(ctaSubtitle,     { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },     "phase9+=0.45")
    .to(socialProof,     { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },     "phase9+=0.55")
    .to(scrollIndicator, { opacity: 1, duration: 0.4, ease: "power2.out" },           "phase9+=0.6")
    .call(() => { heroCta.style.pointerEvents = "auto"; }, null, "phase9+=0.9");

  // ── Debug Scrubber (dev only — see src/debug-controls.js) ───────────

  addDebugControls(tl);

  // ── Form Tab Toggle ─────────────────────────────────────────────────

  formTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      formTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
  document.querySelector(".booking-form__tab[data-tab='academy']")?.classList.add("active");

  // ── Asset Preload & Loader Fade-out ─────────────────────────────────

  // Wait for all growth photos to fully decode before starting the timeline
  const imagePromises = Array.from(growthPhotos).map(img => new Promise(resolve => {
    const el = new Image();
    el.onload  = resolve;
    el.onerror = resolve;
    el.src = img.src;
  }));

  // Wait for video to buffer enough for gapless playback
  const videoLoadPromise = new Promise(resolve => {
    if (heroVideo.readyState >= 3) { resolve(); return; }
    heroVideo.addEventListener("canplaythrough", resolve, { once: true });
    heroVideo.addEventListener("error", resolve, { once: true });
    heroVideo.preload = "auto";
    heroVideo.load();
  });

  // Ensure loader shows for at least 1s so the animation feels intentional
  const elapsed = Date.now() - loadStartTime;
  const minDelayPromise = new Promise(resolve =>
    setTimeout(resolve, Math.max(0, 1000 - elapsed))
  );

  const loader = document.getElementById("loader");

  Promise.all([...imagePromises, videoLoadPromise, minDelayPromise]).then(() => {
    gsap.to(loader, {
      opacity: 0, duration: 0.6, ease: "power2.inOut",
      onComplete: () => {
        loader.style.display = "none";
        tl.play();
      },
    });
  });

  // Brand intro scroll animations
  initBrandIntroAnimations();

});

function initBrandIntroAnimations() {
  const block0 = document.querySelector('[data-brand="0"]');
  if (!block0) return;

  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const strip = block0.querySelector(".brand-img-strip");
  const textEl = block0.querySelector(".brand-text");
  const h2 = block0.querySelector(".brand-text h2");
  const subtitles = block0.querySelectorAll(".brand-subtitle");
  if (!h2) return;
  if (!isDesktop && !strip) return;

  // Hide text initially
  gsap.set(textEl, { y: 400, opacity: 0 });

  // 6 subtitle steps + headline = 7 scroll beats, plus some breathing room
  const totalScroll = () => window.innerHeight * 12;

  if (!isDesktop) {
  // Stack images: first visible, rest waiting below
  const images = strip.querySelectorAll("img");
  images.forEach((img, i) => {
    gsap.set(img, {
      zIndex: i + 1,           // later images sit on top
      yPercent: i === 0 ? 0 : 100, // first visible, rest below
    });
  });
  } else {
    const leftImgs = block0.querySelectorAll(".brand-panel--left img");
    const rightImgs = block0.querySelectorAll(".brand-panel--right img");
    leftImgs.forEach((img, i) => gsap.set(img, { yPercent: i === 0 ? 0 : 100 }));
    rightImgs.forEach((img, i) => gsap.set(img, { yPercent: i === 0 ? 0 : 100 }));
  }

  // Single pinned timeline scrubbed by scroll
  const brandTl = gsap.timeline({
    scrollTrigger: {
      trigger: block0,
      start: "top top",
      end: () => "+=" + (totalScroll() + window.innerHeight * 3),
      pin: true,
      scrub: 3,
      invalidateOnRefresh: true,
    },
  });

  // Hold on first image before anything animates
  brandTl.to({}, { duration: 0.75 });

  // Phase 1: entire text block fades up into view (headline stays visible throughout)
  brandTl.to(textEl, {
    y: 0, opacity: 1,
    duration: 1,
    ease: "power2.out",
  });

  // Hold headline before subtitles start
  brandTl.to({}, { duration: 0.5 });

  // Phase 2–7: subtitle carousel (6 steps) — headline remains visible
  subtitles.forEach((sub, i) => {
    // Slide in
    brandTl.to(sub, {
      y: 0, opacity: 1,
      duration: 0.8,
      ease: "power2.out",
    });
    // Hold
    brandTl.to({}, { duration: 1.4 });
    // Slide out (skip fade-out on last subtitle so it lingers)
    if (i < subtitles.length - 1) {
      brandTl.to(sub, {
        y: -40, opacity: 0,
        duration: 0.8,
        ease: "power2.in",
      });
    }
  });

  if (!isDesktop) {
    // Background images: each slides up to cover the previous, spread across the timeline
    const images = strip.querySelectorAll("img");
    const driftEnd = brandTl.duration();
    const driftStart = 0.75; // matches the initial hold duration
    const driftDuration = driftEnd - driftStart;
    const slideCount = images.length - 1; // first image is already visible

    for (let i = 1; i <= slideCount; i++) {
      const slideStart = driftStart + (driftDuration / slideCount) * (i - 1);
      brandTl.to(images[i], {
        yPercent: 0,
        duration: driftDuration / slideCount,
        ease: "power1.inOut",
      }, slideStart);
    }
  } else {
    const leftImgs = block0.querySelectorAll(".brand-panel--left img");
    const rightImgs = block0.querySelectorAll(".brand-panel--right img");
    const tlDuration = brandTl.duration();
    const driftStart = 0.75;
    const driftRange = tlDuration - driftStart;
    const leftCount = leftImgs.length - 1;   // 4 transitions for 5 images
    const rightCount = rightImgs.length - 1;

    // Left column: transitions spread evenly across the full range, no gaps
    const leftDur = driftRange / leftCount;
    for (let i = 0; i < leftCount; i++) {
      const pos = driftStart + leftDur * i;
      brandTl.to(leftImgs[i],     { yPercent: -100, duration: leftDur, ease: "none" }, pos);
      brandTl.to(leftImgs[i + 1], { yPercent: 0,    duration: leftDur, ease: "none" }, pos);
    }

    // Right column: offset by half a step so columns never move in sync
    const rightDur = driftRange / rightCount;
    const rightOffset = driftStart + (rightDur * 0.5);
    for (let i = 0; i < rightCount; i++) {
      const pos = rightOffset + rightDur * i;
      brandTl.to(rightImgs[i],     { yPercent: -100, duration: rightDur, ease: "none" }, pos);
      brandTl.to(rightImgs[i + 1], { yPercent: 0,    duration: rightDur, ease: "none" }, pos);
    }
  }

  // Hold at the end — images are static, pin stays
  brandTl.to({}, { duration: 1.5 });
}

/* ── Kixx in Action: platform-aware video playback + sound toggle ── */
{
  const cards = document.querySelectorAll(".kixx-video-card");
  const actionVideos = document.querySelectorAll(".kixx-video-card video");
  const soundBtns = document.querySelectorAll(".kixx-sound-btn");
  const desktopMQ = window.matchMedia("(min-width: 768px)");
  let activeVideo = null;

  function remuteBtnUI(video) {
    const btn = video.closest(".kixx-video-card").querySelector(".kixx-sound-btn");
    if (btn) {
      btn.querySelector(".icon-muted").style.display = "";
      btn.querySelector(".icon-unmuted").style.display = "none";
    }
  }

  function pauseVideo(video) {
    video.pause();
    video.muted = true;
    remuteBtnUI(video);
  }

  function playVideo(video) {
    if (activeVideo && activeVideo !== video) {
      pauseVideo(activeVideo);
    }
    activeVideo = video;
    video.play().catch(() => {});
  }

  if (actionVideos.length) {
    // IntersectionObserver — only play the most-visible card
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const video = e.target;
        if (e.isIntersecting && e.intersectionRatio >= 0.6) {
          playVideo(video);
        } else if (!e.isIntersecting) {
          pauseVideo(video);
          if (activeVideo === video) activeVideo = null;
        }
      });
    }, { threshold: [0, 0.6] });

    actionVideos.forEach((v) => io.observe(v));

    // Desktop hover-to-play
    cards.forEach((card) => {
      const video = card.querySelector("video");

      card.addEventListener("mouseenter", () => {
        if (!desktopMQ.matches) return;
        playVideo(video);
      });

      card.addEventListener("mouseleave", () => {
        if (!desktopMQ.matches) return;
        video.pause();
      });
    });
  }

  // Sound toggle — only one video unmuted at a time
  soundBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".kixx-video-card");
      const vid = card.querySelector("video");
      const willUnmute = vid.muted;

      // Mute all others first
      actionVideos.forEach((v) => {
        v.muted = true;
        remuteBtnUI(v);
      });

      // Toggle this one
      vid.muted = !willUnmute;
      btn.querySelector(".icon-muted").style.display = willUnmute ? "none" : "";
      btn.querySelector(".icon-unmuted").style.display = willUnmute ? "" : "none";
    });
  });
}
