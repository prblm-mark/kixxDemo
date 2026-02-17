gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, ScrambleTextPlugin, SplitText);

document.fonts.ready.then(() => {
  const headlineWords = document.querySelectorAll(".headline-word");
  const textNot = document.getElementById("text-not");
  const wordIts = document.getElementById("word-its");
  const wordAbout = document.getElementById("word-about");
  const logo = document.getElementById("logo");

  // Initial states
  gsap.set(headlineWords, { opacity: 0, scale: 5 });
  gsap.set(textNot, { opacity: 0, scale: 0.5 });
  gsap.set(logo, { opacity: 0, y: -20 });

  // Build the timeline
  const tl = gsap.timeline();

  // Phase 1: Words punch in from large scale
  tl.to(headlineWords, {
    opacity: 1,
    scale: 1,
    duration: 0.5,
    stagger: 0.12,
    ease: "back.out(2.5)",
  })

  // Phase 2: IT'S and ABOUT spread apart while NOT fades in and scales up
  .to(wordIts, { x: "-0.4em", duration: 0.6, ease: "expo.out" }, "+=0.2")
  .to(wordAbout, { x: "0.4em", duration: 0.6, ease: "expo.out" }, "<")
  .to(textNot, { opacity: 1, scale: 1, x: "-0.25em", rotation: -12, duration: 0.6, zIndex: 1, ease: "expo.out" }, "<");

});
