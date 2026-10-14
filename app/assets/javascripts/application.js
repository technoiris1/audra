(() => {
  const initializeAudioPlayer = () => {
    const player = document.querySelector("[data-audio-player]");
    if (!player || player.dataset.audioPlayerReady) return;

    const playerBar = player.querySelector(".mini-player");
    const audio = playerBar.querySelector("[data-player-audio]");
    const toggle = playerBar.querySelector("[data-player-toggle]");
    const icon = playerBar.querySelector("[data-player-icon]");
    const title = playerBar.querySelector("[data-player-title]");
    const artist = playerBar.querySelector("[data-player-artist]");
    const progressBar = playerBar.querySelector("[data-player-progress-bar]");
    const progress = playerBar.querySelector("[data-player-progress]");
    const progressThumb = playerBar.querySelector("[data-player-progress-thumb]");
    const currentTime = playerBar.querySelector("[data-player-current]");
    const duration = playerBar.querySelector("[data-player-duration]");
    const volume = playerBar.querySelector("[data-player-volume]");
    const volumeToggle = playerBar.querySelector("[data-player-volume-toggle]");
    const volumeIcon = playerBar.querySelector("[data-player-volume-icon]");
    let animationFrame;
    let isDragging = false;
    let lastVolume = Number(volume.value);

    const formatTime = (seconds) => {
      if (!Number.isFinite(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
      return `${minutes}:${remainingSeconds}`;
    };

    const updateToggle = () => {
      const isPlaying = !audio.paused;
      icon.textContent = isPlaying ? "❚❚" : "▶";
      toggle.setAttribute("aria-label", isPlaying ? "Pause selected track" : "Play selected track");
    };

    const updateProgress = () => {
      const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      progress.style.width = `${percentage}%`;
      progressThumb.style.left = `${percentage}%`;
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
      progressBar.setAttribute("aria-valuenow", percentage.toFixed(1));
    };

    const updateVolumeIcon = () => {
      const isMuted = audio.muted || audio.volume === 0;
      volumeIcon.innerHTML = `<i data-lucide="${isMuted ? "volume-x" : "volume-2"}"></i>`;
      volumeToggle.setAttribute("aria-label", isMuted ? "Unmute" : "Mute");
      volumeToggle.setAttribute("aria-pressed", isMuted ? "true" : "false");
      window.lucide?.createIcons();
    };

    const animateProgress = () => {
      updateProgress();
      if (!audio.paused) animationFrame = requestAnimationFrame(animateProgress);
    };

    const seekTo = (clientX) => {
      if (!audio.duration) return;
      const bounds = progressBar.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      audio.currentTime = percentage * audio.duration;
      updateProgress();
    };

    const selectTrack = (track) => {
      audio.src = track.dataset.playerUrl;
      title.textContent = track.dataset.playerTitle;
      artist.textContent = track.dataset.playerArtist;
      toggle.disabled = false;
      audio.currentTime = 0;
      audio.play().catch(updateToggle);
    };

    player.addEventListener("click", (event) => {
      const track = event.target.closest("[data-player-track]");
      if (track) {
        event.preventDefault();
        event.stopPropagation();
        selectTrack(track);
        return;
      }

      if (event.target.closest("[data-player-toggle]") && audio.src) {
        if (audio.paused) audio.play().catch(updateToggle);
        else audio.pause();
      }

      const skip = event.target.closest("[data-player-skip]");
      if (skip && audio.src) {
        audio.currentTime = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + Number(skip.dataset.playerSkip)));
        updateProgress();
      }
    });

    progressBar.addEventListener("pointerdown", (event) => {
      if (!audio.duration) return;
      isDragging = true;
      progressBar.setPointerCapture(event.pointerId);
      seekTo(event.clientX);
    });
    progressBar.addEventListener("pointermove", (event) => {
      if (isDragging) seekTo(event.clientX);
    });
    progressBar.addEventListener("pointerup", () => {
      isDragging = false;
    });
    progressBar.addEventListener("pointercancel", () => {
      isDragging = false;
    });
    progressBar.addEventListener("click", (event) => seekTo(event.clientX));

    audio.addEventListener("play", () => {
      updateToggle();
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(animateProgress);
    });
    audio.addEventListener("pause", () => {
      updateToggle();
      cancelAnimationFrame(animationFrame);
      updateProgress();
    });
    audio.addEventListener("ended", () => {
      updateToggle();
      cancelAnimationFrame(animationFrame);
      updateProgress();
    });
    audio.addEventListener("timeupdate", updateProgress);
    volume.addEventListener("input", () => {
      const nextVolume = Number(volume.value);
      audio.volume = nextVolume;
      audio.muted = nextVolume === 0;
      if (nextVolume > 0) lastVolume = nextVolume;
      volume.setAttribute("aria-valuenow", volume.value);
      updateVolumeIcon();
    });
    volumeToggle.addEventListener("click", () => {
      if (audio.muted || audio.volume === 0) {
        audio.muted = false;
        audio.volume = lastVolume || 0.8;
        volume.value = audio.volume;
        volume.setAttribute("aria-valuenow", volume.value);
      } else {
        lastVolume = audio.volume;
        audio.muted = true;
      }
      updateVolumeIcon();
    });
    audio.addEventListener("loadedmetadata", () => {
      updateProgress();
      duration.textContent = formatTime(audio.duration);
    });
    progressBar.addEventListener("keydown", (event) => {
      if (!audio.duration || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      audio.currentTime += event.key === "ArrowRight" ? 5 : -5;
      updateProgress();
    });
    audio.volume = Number(volume.value);
    updateVolumeIcon();
    player.dataset.audioPlayerReady = "true";
  };

  document.addEventListener("turbo:load", initializeAudioPlayer);
  document.addEventListener("DOMContentLoaded", initializeAudioPlayer);
})();