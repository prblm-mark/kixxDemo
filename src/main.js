gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, ScrambleTextPlugin, SplitText);

document.fonts.ready.then(() => {
  const headlineWords = document.querySelectorAll(".headline-word:not(#word-growth)");
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

  // Initial states
  gsap.set(headlineWords, { opacity: 0, scale: 5 });
  gsap.set(textNot, { opacity: 0, scale: 0.5 });
  gsap.set(logo, { opacity: 0, y: -20 });
  gsap.set(wordGrowth, { opacity: 0, scale: 0 });
  gsap.set(growthRows, { opacity: 0, y: 0 });
  gsap.set(growthPhotoCycler, { opacity: 0, scale: 0 });

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
  .addLabel("phase5", "-=0.35");

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
  tl.to(growthPhotoCycler, { opacity: 0.5, scale: 1, duration: 2.2, ease: "power2.out" }, "phase5-=0.45")
  .add((() => {
    const totalImages = growthPhotos.length;
    const cycles = 2;
    const finalIndex = totalImages - 1;
    const sequence = [];
    for (let c = 0; c < cycles; c++) {
      for (let i = 0; i < totalImages; i++) sequence.push(i);
    }
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
      duration: 2.2,
      ease: "power2.out",
      snap: 1,
      onUpdate: updateFrame,
    });
  })(), "<");

  // Phase 6a: GROWTH goes outline + outer rows exit
  tl.addLabel("phase6", "phase5+=0.6");

  // Main GROWTH: solid fill → outline stroke
  tl.set(wordGrowth, { webkitTextStroke: "2px #FF7500" }, "phase6")
  .to(wordGrowth, { color: "rgba(255, 117, 0, 0)", duration: 0.2, ease: "power2.inOut" }, "phase6")

  // Outer rows fade out
  const outerRows = document.querySelectorAll("[data-growth-row='-2'], [data-growth-row='2']");
  tl.to(outerRows, { opacity: 0, duration: 0.3, ease: "power2.in" }, "phase6")

  // Phase 6b: ScrambleText GROWTH → REAL
  const innerRows = [
    document.querySelector("[data-growth-row='-1']"),
    wordGrowth,
    document.querySelector("[data-growth-row='1']"),
  ];
  tl.to(innerRows, {
    scrambleText: { text: "REAL", chars: "GROWTHEAL", speed: 0.6 },
    duration: 0.35,
    stagger: 0.03,
  }, "phase6+=0.15");

  // Debug controls (see src/debug-controls.js)
  addDebugControls(tl);

});
