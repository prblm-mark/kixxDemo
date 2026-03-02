/**
 * debug-controls.js — Development-only timeline scrubber
 *
 * Renders a fixed play/pause button and range slider at the bottom
 * of the viewport for scrubbing through the GSAP master timeline.
 *
 * REMOVE before production: delete this <script> tag and the
 * addDebugControls(tl) call in main.js.
 */
function addDebugControls(tl) {
  // Fixed control bar pinned to bottom of viewport
  const controls = document.createElement("div");
  Object.assign(controls.style, {
    position: "fixed", bottom: "20px", left: "5%", width: "90%", zIndex: 9999,
    display: "flex", alignItems: "center", gap: "10px",
  });
  document.body.appendChild(controls);

  // Play / Pause / Replay button
  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  Object.assign(playBtn.style, {
    padding: "6px 16px", background: "#333", color: "#fff",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px",
  });
  controls.appendChild(playBtn);

  // Range slider mapped to timeline progress (0–1000 → 0–1)
  const scrubber = document.createElement("input");
  scrubber.type = "range";
  scrubber.min = 0;
  scrubber.max = 1000;
  scrubber.value = 0;
  scrubber.style.flex = "1";
  controls.appendChild(scrubber);

  // Dragging the slider pauses playback and seeks to that position
  scrubber.addEventListener("input", () => {
    tl.pause();
    tl.progress(scrubber.value / 1000);
    playBtn.textContent = "Play";
  });

  // Toggle play/pause; restart from beginning if timeline is complete
  playBtn.addEventListener("click", () => {
    if (tl.isActive()) {
      tl.pause();
      playBtn.textContent = "Play";
    } else {
      if (tl.progress() >= 1) tl.progress(0);
      tl.play();
      playBtn.textContent = "Pause";
    }
  });

  // Keep slider in sync during playback
  tl.eventCallback("onUpdate", () => {
    scrubber.value = Math.round(tl.progress() * 1000);
  });

  tl.eventCallback("onComplete", () => {
    playBtn.textContent = "Replay";
  });
}
