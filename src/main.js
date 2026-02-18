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

  // Initial states
  gsap.set(headlineWords, { opacity: 0, scale: 5 });
  gsap.set(textNot, { opacity: 0, scale: 0.5 });
  gsap.set(logo, { opacity: 0, y: -20 });
  gsap.set(wordGrowth, { opacity: 0, scale: 0 });
  gsap.set(growthRows, { opacity: 0, y: 0 });

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
  .to(wipePanel, { scaleX: 1, duration: 0.6, ease: "power2.inOut" }, "-=0.3")
  .to(textNot, { opacity: 0, scale: 0.5, duration: 0.25, ease: "power2.in" }, "<+=0.2")
  .to(wordIts, { x: "0em", duration: 0.6, ease: "power2.inOut" }, "<")
  .to(wordAbout, { x: "0em", duration: 0.6, ease: "power2.inOut" }, "<")
  .to([wordThe, wordScore], { opacity: 0, y: 60, duration: 0.3, stagger: 0.05, ease: "power2.in" }, "<-=0.05")

  // Phase 4: IT'S/ABOUT scale out + GROWTH scales in
  .to(wordIts, { opacity: 0, scale: 5, x: "-2em", duration: 0.25, ease: "power2.in" }, "+=0.2")
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

  // Debug controls (see src/debug-controls.js)
  addDebugControls(tl);

});
