/* drumkit.js
   - Uses relative media paths in drumkit_media/
   - Preloads audio sources to reduce latency
   - Supports click/touch and keyboard (keydown)
   - Adds a ripple effect and robust pressed state handling
*/

(() => {
  // map keys to audio filenames (relative to this file)
  const audioSrc = {
    w: "drumkit_media/tom-1.mp3",
    a: "drumkit_media/tom-2.mp3",
    s: "drumkit_media/tom-3.mp3",
    d: "drumkit_media/tom-4.mp3",
    j: "drumkit_media/snare.mp3",
    k: "drumkit_media/crash.mp3",
    l: "drumkit_media/kick-bass.mp3"
  };

  // Preload audio objects (for quicker startup) but we create new Audio when playing
  const preloaded = {};
  Object.entries(audioSrc).forEach(([key, src]) => {
    const a = new Audio();
    a.src = src;
    a.preload = "auto";
    preloaded[key] = a;
  });

  // DOM references
  const pads = Array.from(document.querySelectorAll(".drum"));
  const volumeControl = document.getElementById("volume");

  // Utility: play sound (creates fresh Audio so overlapping hits work)
  function playSound(key, volume = 0.9) {
    key = (key + "").toLowerCase();
    if (!audioSrc[key]) return console.log("No sound mapped for:", key);

    // Create and play
    const sound = new Audio(audioSrc[key]);
    sound.volume = Number(volume);
    // small hack to improve startup: use preloaded object to warm up cache
    // (browsers will reuse if resource cached)
    try {
      sound.play();
    } catch (err) {
      // Autoplay restrictions can sometimes throw; ignore silently for user interactions.
      console.warn("play() failed:", err);
    }
  }

  // Visual animation for pad
  function buttonAnimation(currentKey) {
    if (!currentKey) return;
    const selector = "." + currentKey.toLowerCase();
    const activeButton = document.querySelector(selector);
    if (!activeButton) return;

    // Add 'pressed' class
    activeButton.classList.add("pressed");

    // Remove after short delay (safe-guard in case of repeat), ensure previous timers don't stack badly
    window.setTimeout(() => {
      activeButton.classList.remove("pressed");
    }, 110);
  }

  // Create ripple on a pad (visual)
  function createRipple(target, x, y) {
    if (!target) return;
    const rect = target.getBoundingClientRect();
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const size = Math.max(rect.width, rect.height) * 0.9;
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = x - rect.left - size / 2 + "px";
    ripple.style.top = y - rect.top - size / 2 + "px";
    target.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
  }

  // Event handlers for clicks/taps
  pads.forEach(pad => {
    // Click / pointerdown for better mobile support
    pad.addEventListener("pointerdown", (ev) => {
      const key = pad.dataset.key;
      // Visual
      pad.classList.add("pressed");
      // Ripple
      createRipple(pad, ev.clientX, ev.clientY);
      // Audio (use current volume)
      playSound(key, volumeControl?.value ?? 0.9);
      // ensure pressed class removed after short time
      setTimeout(() => pad.classList.remove("pressed"), 120);
    });

    // Keyboard focus + Enter/Space activation
    pad.addEventListener("keydown", (ev) => {
      if (ev.code === "Space" || ev.code === "Enter") {
        ev.preventDefault();
        pad.click();
      }
    });
  });

  // Keyboard support (keydown gives immediate response and catches repeated keys)
  document.addEventListener("keydown", (ev) => {
    // Avoid interfering with typing in focused inputs (if any)
    const active = document.activeElement;
    if (active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable)) {
      return;
    }

    const key = ev.key.toLowerCase();
    if (!audioSrc[key]) return;

    // Play sound + animation
    playSound(key, volumeControl?.value ?? 0.9);

    // Visual: add pressed to the pad element
    const padEl = document.querySelector("." + key);
    if (padEl) {
      padEl.classList.add("pressed");
      setTimeout(() => padEl.classList.remove("pressed"), 110);
    }
  });

  // Volume control listener
  if (volumeControl) {
    volumeControl.addEventListener("input", () => {
      // no global volume available for existing created Audio objects,
      // we pass current volume into playSound each time.
    });
  }

  // Accessibility: allow clicking pads with Enter key by making them focusable
  pads.forEach(p => p.setAttribute("tabindex", "0"));

  // Prewarm: touch/gesture to allow audio on some mobile devices - play one silent audio briefly on first user gesture
  let warmed = false;
  function warmAudioOnFirstGesture() {
    if (warmed) return;
    // play a short silent buffer by quickly playing an already loaded sound at 0 volume
    const anyKey = Object.keys(audioSrc)[0];
    if (anyKey) {
      const aud = preloaded[anyKey];
      if (aud) {
        aud.volume = 0;
        aud.play().catch(() => {});
        setTimeout(() => { try { aud.pause(); } catch {} }, 200);
      }
    }
    warmed = true;
    window.removeEventListener("pointerdown", warmAudioOnFirstGesture);
  }
  window.addEventListener("pointerdown", warmAudioOnFirstGesture, { once: true });

})();
