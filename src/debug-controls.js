function addDebugControls(tl) {
  const controls = document.createElement("div");
  Object.assign(controls.style, {
    position: "fixed", bottom: "20px", left: "5%", width: "90%", zIndex: 9999,
    display: "flex", alignItems: "center", gap: "10px",
  });
  document.body.appendChild(controls);

  const playBtn = document.createElement("button");
  playBtn.textContent = "Play";
  Object.assign(playBtn.style, {
    padding: "6px 16px", background: "#333", color: "#fff",
    border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "14px",
  });
  controls.appendChild(playBtn);

  const scrubber = document.createElement("input");
  scrubber.type = "range";
  scrubber.min = 0;
  scrubber.max = 1000;
  scrubber.value = 0;
  scrubber.style.flex = "1";
  controls.appendChild(scrubber);

  scrubber.addEventListener("input", () => {
    tl.pause();
    tl.progress(scrubber.value / 1000);
    playBtn.textContent = "Play";
  });

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

  tl.eventCallback("onUpdate", () => {
    scrubber.value = Math.round(tl.progress() * 1000);
  });

  tl.eventCallback("onComplete", () => {
    playBtn.textContent = "Replay";
  });
}
