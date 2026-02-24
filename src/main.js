gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, ScrambleTextPlugin, SplitText);

document.fonts.ready.then(() => {
  const headlineWords = document.querySelectorAll(".headline-word:not(#word-growth):not(#word-thats-what):not(#word-is-about)");
  const textNot = document.getElementById("text-not");
  const wordIts = document.getElementById("word-its");
  const wordAbout = document.getElementById("word-about");
  const logo = document.getElementById("logo");
  const wipePanel = document.getElementById("wipe-panel");
  const wordThe = document.getElementById("word-the");
  const wordScore = document.getElementById("word-score");
  const wordGrowth = document.getElementById("word-growth");
  const growthRows = document.querySelectorAll("[data-growth-row]");
  const growthPhotoCycler = document.getElementById("growth-photo-cycler");
  const growthPhotos = growthPhotoCycler.querySelectorAll("img");
  const wordGrowthText     = wordGrowth.querySelector("[data-growth-text]");
  const benefitFriendships = document.getElementById("benefit-friendships");
  const benefitProgress    = document.getElementById("benefit-progress");
  const benefitConfidence  = document.getElementById("benefit-confidence");
  const wordThatsWhat      = document.getElementById("word-thats-what");
  const wordKixxClosing    = document.getElementById("word-kixx-closing");
  const wordIsAbout        = document.getElementById("word-is-about");
  const heroVideo          = document.getElementById("hero-video");
  const videoOverlay       = document.getElementById("video-overlay");
  const phase9Cta          = document.getElementById("phase9-cta");
  const p9Nav              = document.getElementById("p9-nav");
  const p9Title            = document.getElementById("p9-title");
  const p9Subtitle         = document.getElementById("p9-subtitle");
  const p9Form             = document.getElementById("p9-form");
  const p9Scroll           = document.getElementById("p9-scroll");
  const p9Social           = document.getElementById("p9-social");


  // Give cycler an explicit height matching the grid cell aspect ratio
  // Children are all absolute so it has no intrinsic height
  const cellWidth  = (window.innerWidth - 12) / 3;
  const cellHeight = (window.innerHeight - 12) / 3;
  gsap.set(growthPhotoCycler, { height: growthPhotoCycler.offsetWidth * cellHeight / cellWidth });

  // Video starts at the same visual size as the cycler (cyclerWidth * 1.4 / viewportWidth)
  const videoStartScale = growthPhotoCycler.offsetWidth * 1.4 / window.innerWidth;

  // Initial states
  gsap.set(headlineWords, { opacity: 0, scale: 5, color: "#000000" });
  gsap.set(textNot, { opacity: 0, scale: 0.5 });
  gsap.set(logo, { opacity: 0, y: -20 });
  gsap.set(wordGrowth, { opacity: 0, scale: 0 });
  gsap.set(growthRows, { opacity: 0, y: 0 });
  gsap.set(growthPhotoCycler, { opacity: 0, scale: 0 });
  gsap.set("[data-growth-text]", { display: "inline-block" });
  gsap.set([benefitFriendships, benefitProgress, benefitConfidence], { opacity: 0, x: "-2em" });
  gsap.set([wordThatsWhat, wordIsAbout], { scale: 5 });
  gsap.set(wordKixxClosing, { scale: 10, rotation: -12 });
  gsap.set(heroVideo,  { scale: videoStartScale, opacity: 0, transformOrigin: "center center" });
  gsap.set(p9Nav,      { x: "-100%" });
  gsap.set(p9Title,    { scale: 3, opacity: 0, transformOrigin: "center center" });
  gsap.set(p9Subtitle, { y: 20, opacity: 0 });
  gsap.set(p9Form,     { y: 30, opacity: 0 });
  gsap.set(p9Scroll,   { opacity: 0 });
  gsap.set(p9Social,   { y: 20, opacity: 0 });

  // Build the timeline (paused for scrubber control)
  const tl = gsap.timeline({ paused: true });

  // Phase 1: Words punch in from large scale
  tl.to(headlineWords, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.08,
    ease: "back.out(2.5)",
  })
  .set(headlineWords, { color: "#FF7500", mixBlendMode: "difference" })

  // Phase 2: IT'S and ABOUT spread apart while NOT fades in and scales up
  .to(wordIts, { x: "-0.4em", duration: 0.6, ease: "expo.out" }, "+=0.1")
  .to(wordAbout, { x: "0.4em", duration: 0.6, ease: "expo.out" }, "<")
  .to(textNot, { opacity: 1, scale: 1, x: "-0.25em", rotation: -12, duration: 0.6, zIndex: 1, ease: "expo.out" }, "<")

  // Phase 3: Black wipe with text color inversion
  .to(wipePanel, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.25")
  .to(textNot, { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.in" }, "<+=0.2")
  .to(wordIts, { x: "0em", duration: 0.4, ease: "power2.inOut" }, "<")
  .to(wordAbout, { x: "0em", duration: 0.4, ease: "power2.inOut" }, "<")
  .to([wordThe, wordScore], { opacity: 0, y: 60, duration: 0.3, stagger: 0.05, ease: "power2.in" }, "<-=0.05")

  // Phase 4: IT'S/ABOUT scale out + GROWTH scales in
  .to(wordIts, { opacity: 0, scale: 5, x: "-2em", duration: 0.25, ease: "power2.in" }, "+=0.1")
  .to(wordAbout, { opacity: 0, scale: 5, x: "2em", duration: 0.25, ease: "power2.in" }, "<")
  .to(wordGrowth, { opacity: 1, scale: 1, duration: 0.8, ease: "back.out(3)" }, "<+=0.1")

  // Phase 5: Stacked GROWTH — outlined rows stagger outward from center
  .addLabel("phase5", "-=0.4");

  growthRows.forEach((row) => {
    const index = parseInt(row.dataset.growthRow);
    const yTarget = `${index * 0.8}em`;
    const delay = (Math.abs(index) - 1) * 0.05;

    tl.to(row, {
      opacity: 1,
      y: yTarget,
      duration: 0.2,
      ease: "back.out(2)",
    }, `phase5+=${delay}`);
  });

  // Growth photo: starts during Phase 4, scales through Phase 5 into Phase 6
  const scaleDuration = 1.35;   // cycler scale-up
  const cycleDuration = 1.7;    // image cycling — ends just before CONFIDENCE fully lands
  tl.to(growthPhotoCycler, { opacity: 0.5, scale: 1.4, duration: scaleDuration, ease: "power2.out" }, "phase5-=0.45")
  .add((() => {
    const totalImages = growthPhotos.length;
    const finalIndex = Array.from(growthPhotos).findIndex(img => img.src.includes("DSC02398.webp"));
    const sequence = [];
    for (let i = 0; i < totalImages; i++) sequence.push(i);
    for (let i = 0; i <= finalIndex; i++) sequence.push(i);

    const playhead = { frame: 0 };
    let currentFrame = -1;

    function updateFrame() {
      const stepIndex = Math.min(Math.round(playhead.frame), sequence.length - 1);
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
      duration: cycleDuration,
      ease: "none",
      snap: 1,
      onUpdate: updateFrame,
    });
  })(), "<");

  // Phase 6a: GROWTH goes outline + outer rows exit
  tl.addLabel("phase6", "phase5+=0.3");

  // Main GROWTH inner text: solid fill → outline stroke
  tl.set(wordGrowthText, { webkitTextStroke: "2px #FF7500" }, "phase6")
  .to(wordGrowthText, { color: "rgba(255, 117, 0, 0)", duration: 0.2, ease: "power2.inOut" }, "phase6")

  // Outer rows fade out
  const outerRows = document.querySelectorAll("[data-growth-row='-2'], [data-growth-row='2']");
  tl.to(outerRows, { opacity: 0, duration: 0.3, ease: "power2.in" }, "phase6")

  // Phase 6b: ScrambleText GROWTH → REAL (target inner text spans only)
  const innerRowTexts = [
    document.querySelector("[data-growth-row='-1'] [data-growth-text]"),
    wordGrowthText,
    document.querySelector("[data-growth-row='1'] [data-growth-text]"),
  ];
  // Outer row spans — used for Phase 6.3 slide (benefit words travel with them)
  const innerRowWraps = [
    document.querySelector("[data-growth-row='-1']"),
    wordGrowth,
    document.querySelector("[data-growth-row='1']"),
  ];

  tl.to(innerRowTexts, {
    scrambleText: { text: "REAL", chars: "GROWTHEAL", speed: 0.4 },
    duration: 0.6,
    stagger: 0.03,
  }, "phase6+=0.15");

  // Phase 6.3: rows slide left — benefit words travel with them
  tl.addLabel("phase63", "phase6+=0.2")
  .to(innerRowWraps, {
    x: "-20vw",
    duration: 0.7,
    ease: "expo.out",
    stagger: 0.06,
  }, "phase63")

  // Phase 6.4: benefit words emerge from behind REAL (x: -2em → 0em)
  .addLabel("phase64", "phase63+=0.4")
  .to([benefitFriendships, benefitProgress, benefitConfidence], {
    opacity: 1,
    x: "0em",
    duration: 0.45,
    ease: "expo.out",
    stagger: 0.1,
  }, "phase64")

  // Phase 7: REAL rows exit left, benefit words exit right — random stagger, simultaneous start
  tl.addLabel("phase7", "phase64+=0.9")

  .to(innerRowTexts, {
    x: () => `${gsap.utils.random(-80, -140)}vw`,
    duration: 0.6,
    ease: "expo.in",
    stagger: { each: 0.08, from: "random" },
  }, "phase7")

  .to([benefitFriendships, benefitProgress, benefitConfidence], {
    x: () => `${gsap.utils.random(80, 140)}vw`,
    duration: 0.6,
    ease: "expo.in",
    stagger: { each: 0.08, from: "random" },
  }, "phase7")

  // Phase 7 → video: cycler cross-fades to video, video expands to full screen
  .call(() => { heroVideo.play().catch(() => {}); }, null, "phase7-=0.45")
  .to(growthPhotoCycler, { opacity: 0, duration: 0.2, ease: "power2.in" }, "phase7-=0.25")
  .to(heroVideo, { opacity: 1, duration: 0.2, ease: "power2.in" }, "phase7-=0.25")
  .to(heroVideo, { scale: 1, duration: 0.7, ease: "expo.out" }, "phase7-=0.25")
  .to(videoOverlay, { opacity: 1, duration: 0.5, ease: "power2.out" }, "phase7-=0.25")

  // Phase 8: THATS WHAT KIXX IS ABOUT — punches in while video is expanding
  tl.addLabel("phase8", "phase7+=0.1")

    // THATS WHAT crashes in
    .to(wordThatsWhat, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, "phase8+=0.05")

    // IS ABOUT crashes in tight behind
    .to(wordIsAbout, { opacity: 1, scale: 1, duration: 0.4, ease: "expo.out" }, "phase8+=0.13")

    // KIXX explodes in from massive scale, slightly offset
    .to(wordKixxClosing, { opacity: 1, scale: 1, duration: 0.55, ease: "expo.out" }, "phase8+=0.22")

  // Phase 8 exit
  .addLabel("phase8exit", "phase8+=0.9")
    .to(wordKixxClosing, { opacity: 0, duration: 0.4, ease: "power2.in" }, "phase8exit")
    .to(wordThatsWhat, { y: "-120%", opacity: 0, duration: 0.5, ease: "expo.in" }, "phase8exit+=0.05")
    .to(wordIsAbout, { y: "120%", opacity: 0, duration: 0.5, ease: "expo.in" }, "phase8exit+=0.05");

  // Phase 9: CTA layout slides in after phase8 exits
  tl.addLabel("phase9", "phase8exit+=0.55")
    .to(p9Nav,      { x: "0%",  duration: 0.55, ease: "power3.out" },           "phase9")
    .to(p9Title,    { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(2)" }, "phase9+=0.15")
    .to(p9Subtitle, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },      "phase9+=0.45")
    .to(p9Form,     { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },      "phase9+=0.35")
    .to(p9Social,   { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },       "phase9+=0.55")
    .to(p9Scroll,   { opacity: 1, duration: 0.4, ease: "power2.out" },            "phase9+=0.6")
    .call(() => { phase9Cta.style.pointerEvents = "auto"; }, null, "phase9+=0.9");

  // Phase 9 tab toggle
  document.querySelectorAll(".p9-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".p9-tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });
  document.querySelector(".p9-tab[data-tab='academy']").classList.add("active");

  // Debug controls (see src/debug-controls.js)
  addDebugControls(tl);

});
