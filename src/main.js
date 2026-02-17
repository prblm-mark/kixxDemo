gsap.registerPlugin(ScrollTrigger, ScrollSmoother, TextPlugin, ScrambleTextPlugin, SplitText);

document.fonts.ready.then(() => {
  const headlineWords = document.querySelectorAll(".headline-word");
  const textNot = document.getElementById("text-not");
  const logo = document.getElementById("logo");

  // Initial states
  gsap.set(headlineWords, { opacity: 0, scale: 3 });
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

  // Phase 2: "NOT" punches in
  // .to(
  //   textNot,
  //   {
  //     opacity: 1,
  //     scale: 1,
  //     rotation: -12,
  //     duration: 0.5,
  //     ease: "back.out(2.5)",
  //   },
  //   "-=0.2"
  // );

});
