/* ==========================================
   Persistent Audio Player Controller
   ========================================== */

const Player = {
  audioEl: null,
  playerBar: null,
  playBtn: null,
  seekBar: null,
  timeDisplay: null,
  titleEl: null,
  subtitleEl: null,
  currentSong: null,

  init() {
    this.audioEl = document.getElementById('global-audio-element');
    this.playerBar = document.getElementById('audio-player-bar');
    this.playBtn = document.getElementById('player-play-btn');
    this.seekBar = document.getElementById('player-seek-bar');
    this.timeDisplay = document.getElementById('player-time');
    this.titleEl = document.getElementById('player-song-title');
    this.subtitleEl = document.getElementById('player-song-subtitle');

    if (!this.audioEl) return;

    this.playBtn.addEventListener('click', () => this.togglePlay());
    this.audioEl.addEventListener('timeupdate', () => this.updateProgress());
    this.audioEl.addEventListener('ended', () => this.onEnded());
    
    this.seekBar.addEventListener('input', (e) => {
      if (this.audioEl.duration) {
        this.audioEl.currentTime = (e.target.value / 100) * this.audioEl.duration;
      }
    });

    document.getElementById('player-close-btn')?.addEventListener('click', () => this.hide());
  },

  playSong(song) {
    if (!song || !song.audioUrl) return;
    this.currentSong = song;

    this.titleEl.textContent = song.titleKannada || song.titleEnglish;
    this.subtitleEl.textContent = song.titleEnglish || 'Kannada Worship';
    this.playerBar.style.display = 'flex';

    this.audioEl.src = song.audioUrl;
    this.audioEl.play().then(() => {
      this.playBtn.textContent = '⏸';
    }).catch(err => {
      console.warn('Audio play failed:', err);
      this.playBtn.textContent = '▶';
    });
  },

  togglePlay() {
    if (!this.audioEl.src) return;
    if (this.audioEl.paused) {
      this.audioEl.play();
      this.playBtn.textContent = '⏸';
    } else {
      this.audioEl.pause();
      this.playBtn.textContent = '▶';
    }
  },

  updateProgress() {
    if (!this.audioEl.duration) return;
    const pct = (this.audioEl.currentTime / this.audioEl.duration) * 100;
    this.seekBar.value = pct;

    const curr = this.formatTime(this.audioEl.currentTime);
    const dur = this.formatTime(this.audioEl.duration);
    this.timeDisplay.textContent = `${curr} / ${dur}`;
  },

  formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  },

  onEnded() {
    this.playBtn.textContent = '▶';
    this.seekBar.value = 0;
  },

  hide() {
    this.audioEl.pause();
    this.playerBar.style.display = 'none';
  }
};