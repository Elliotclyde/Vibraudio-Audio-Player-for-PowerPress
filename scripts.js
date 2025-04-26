let playAnimation = { goToAndStop: () => { }, playSegments: () => { } }

const audioPlayerContainers = document.querySelectorAll('.vibraudio-audio-player-container');

[...audioPlayerContainers].forEach(player => {
  const playIconContainer = player.querySelector('.play-icon');
  const playSvg = player.querySelector('.play-svg');
  const pauseSvg = player.querySelector('.pause-svg');
  const seekSlider = player.querySelector('.seek-slider');
  const skipForward = player.querySelector('.skip-forward-icon');
  const skipBack = player.querySelector('.skip-back-icon');

  const shareButton = player.querySelector('.share-icon');

  const audio = player.querySelector('audio');
  const durationContainer = player.querySelector('.duration');
  const currentTimeContainer = player.querySelector('.current-time');
  let raf = null;

  let playState = 'play';
  // let muteState = 'unmute';

  shareButton.addEventListener('click', (b) => {
    navigator.share({ url: b.target.dataset.url, title: b.target.dataset.title })
  });
  playIconContainer.addEventListener('click', () => {
    if (playState === 'play') {
      audio.play();
      requestAnimationFrame(whilePlaying);
      playState = 'pause';
      playSvg.style.display = 'none';
      pauseSvg.style.display = 'inline-block';
    } else {
      audio.pause();
      cancelAnimationFrame(raf);
      playState = 'play';
      playSvg.style.display = 'inline-block';
      pauseSvg.style.display = 'none';
    }
  });

  skipForward.addEventListener('click', () => {
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 30);
    seekSlider.value = Math.floor(audio.currentTime);
    if (playState === 'play') {
      showRangeProgress(seekSlider);
    }
  });
  skipBack.addEventListener('click', () => {
    audio.currentTime = Math.max(0, audio.currentTime - 30);
    seekSlider.value = Math.floor(audio.currentTime);
    if (playState === 'play') {
      showRangeProgress(seekSlider);
    }
  });

  const showRangeProgress = (rangeInput) => {
    if (rangeInput === seekSlider) player.style.setProperty('--seek-before-width', rangeInput.value / rangeInput.max * 100 + '%');
  }

  seekSlider.addEventListener('input', (e) => {
    showRangeProgress(e.target);
  });



  const calculateTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    const returnedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;
    return `${minutes}:${returnedSeconds}`;
  }

  const displayDuration = () => {
    durationContainer.textContent = calculateTime(audio.duration);
  }

  const setSliderMax = () => {
    seekSlider.max = Math.floor(audio.duration);
  }

  const displayBufferedAmount = () => {
    let bufferedAmount = 0;
    try {
      bufferedAmount = Math.floor(audio.buffered.end(audio.buffered.length - 1));
    }
    catch (e) {
      bufferedAmount = 0;
    }
    player.style.setProperty('--buffered-width', `${(bufferedAmount / seekSlider.max) * 100}%`);
  }

  const whilePlaying = () => {
    seekSlider.value = Math.floor(audio.currentTime);
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    player.style.setProperty('--seek-before-width', `${seekSlider.value / seekSlider.max * 100}%`);
    raf = requestAnimationFrame(whilePlaying);
  }

  if (audio.readyState > 0) {
    displayDuration();
    setSliderMax();
    displayBufferedAmount();
  } else {
    audio.addEventListener('loadedmetadata', () => {
      displayDuration();
      setSliderMax();
      displayBufferedAmount();
    });
  }

  audio.addEventListener('progress', displayBufferedAmount);

  seekSlider.addEventListener('input', () => {
    currentTimeContainer.textContent = calculateTime(seekSlider.value);
    if (!audio.paused) {
      cancelAnimationFrame(raf);
    }
  });

  seekSlider.addEventListener('change', () => {
    audio.currentTime = seekSlider.value;
    if (!audio.paused) {
      requestAnimationFrame(whilePlaying);
    }
  });
  let image = player.querySelector('.cover-image');
  if (image) {


    // Using builder
    vibraudio_Vibrant.from(image.src)
      .getPalette()
      .then((palette) => {
        player.style.setProperty('--bg-color', `rgb(${palette.DarkMuted.r}, ${palette.DarkMuted.g},${palette.DarkMuted.b})`)
        player.style.setProperty('--bg-color-2', `rgb(${palette.DarkVibrant.r}, ${palette.DarkVibrant.g},${palette.DarkVibrant.b})`)

      });

  }
});
