/* ============================================================
   AZALEA VAULT — Full-screen split door (orchestration)
   ============================================================
   Plays when URL has ?vault=1. Total runtime ~1.3 seconds.
*/
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (params.get('vault') !== '1') return;

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================ SOUND ENGINE ============================
  let audioCtx = null;
  let soundEnabled = true;

  function getCtx() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    return audioCtx;
  }

  // Mechanical "tink" — short filtered noise burst + tiny low thud
  function playClick(when) {
    if (!soundEnabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + (when || 0);

    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.04), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 1.6);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900 + Math.random() * 300;
    filter.Q.value = 3;
    const gain = ctx.createGain();
    gain.gain.value = 0.18;
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);

    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.04);
    og.gain.setValueAtTime(0.14, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(og).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.06);
  }

  function playWhir(when, duration) {
    if (!soundEnabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + (when || 0);

    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, t);
    filter.frequency.linearRampToValueAtTime(240, t + duration * 0.5);
    filter.frequency.linearRampToValueAtTime(160, t + duration);
    filter.Q.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.09, t + 0.1);
    gain.gain.linearRampToValueAtTime(0.06, t + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);

    const rate = 6;
    const tickCount = Math.max(1, Math.floor(duration * rate));
    for (let i = 0; i < tickCount; i++) {
      playClick((when || 0) + (i / rate) + Math.random() * 0.025);
    }
  }

  function playThunk(when) {
    if (!soundEnabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + (when || 0);

    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.6);
    og.gain.setValueAtTime(0.85, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    osc.connect(og).connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.8);

    const osc2 = ctx.createOscillator();
    const og2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(220, t);
    osc2.frequency.exponentialRampToValueAtTime(75, t + 0.25);
    og2.gain.setValueAtTime(0.18, t);
    og2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.connect(og2).connect(ctx.destination);
    osc2.start(t); osc2.stop(t + 0.4);

    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.18), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.value = 350;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.55, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    src.connect(nf).connect(ng).connect(ctx.destination);
    src.start(t);
  }

  function playRumble(when, duration) {
    if (!soundEnabled) return;
    const ctx = getCtx(); if (!ctx) return;
    const t = ctx.currentTime + (when || 0);

    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 130;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.08);
    gain.gain.linearRampToValueAtTime(0.14, t + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, t + duration);
    src.connect(filter).connect(gain).connect(ctx.destination);
    src.start(t);
  }

  // ============================ VAULT MARKUP ============================
  function buildVault() {
    const overlay = document.createElement('div');
    overlay.className = 'vault-overlay';
    overlay.setAttribute('aria-hidden', 'false');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-label', 'Entering the Azalea House Collection');

    // Generate bolts for one half — placed along the outer 3 edges
    // (top, bottom, and the outer side away from the seam).
    function makeBolts(side) {
      const bolts = [];
      const isLeft = side === 'left';
      const outer = isLeft ? 'left' : 'right';

      // Top edge — 3 bolts across the half
      for (let i = 0; i < 3; i++) {
        const x = 15 + i * 30;
        bolts.push(`<span class="vault-bolt" style="top:4vh;left:${x}%"></span>`);
      }
      // Bottom edge — 3 bolts
      for (let i = 0; i < 3; i++) {
        const x = 15 + i * 30;
        bolts.push(`<span class="vault-bolt" style="bottom:4vh;left:${x}%"></span>`);
      }
      // Outer side — 4 bolts vertically
      for (let i = 0; i < 4; i++) {
        const y = 18 + i * 21;
        bolts.push(`<span class="vault-bolt" style="${outer}:2vw;top:${y}%"></span>`);
      }
      return bolts.join('');
    }

    const spokes = Array.from({ length: 6 }, (_, i) => `<div class="vault-spoke" style="--i:${i}"></div>`).join('');

    overlay.innerHTML = `
      <div class="vault-controls">
        <button class="vault-ctrl-btn" id="vaultSoundBtn" aria-label="Toggle sound" title="Sound">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <span id="vaultSoundLabel">Sound on</span>
        </button>
        <button class="vault-ctrl-btn" id="vaultSkipBtn" aria-label="Skip intro">Skip</button>
      </div>

      <div class="vault-half vault-half-left">${makeBolts('left')}</div>
      <div class="vault-half vault-half-right">${makeBolts('right')}</div>

      <div class="vault-seam"></div>

      <div class="vault-handle-pos">
        <div class="vault-handle">
          <div class="vault-handle-inner">
            ${spokes}
            <div class="vault-handle-hub"></div>
          </div>
        </div>
      </div>

      <div class="vault-flash"></div>
    `;

    return overlay;
  }

  // ============================ SEQUENCE (~1.3s total) ============================
  function runSequence(overlay) {
    overlay.classList.add('unlocking');

    // T=0 → 0.55s : Handle spins with mechanical whir + ratchet ticks
    playWhir(0, 0.5);
    // T=0.55s : Heavy thunk + flash (bolts retract)
    playThunk(0.55);

    // T=0.65s → 1.1s : Doors slide apart
    setTimeout(() => {
      overlay.classList.add('opening');
      playRumble(0, 0.45);
    }, 650);

    // T=1.2s : Cleanup — fade out and remove overlay
    setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('vault');
        history.replaceState({}, '', url.toString());
      } catch (_) {}
      overlay.classList.add('dismissed');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 350);
    }, 1200);
  }

  function runReducedMotion(overlay) {
    setTimeout(() => {
      overlay.classList.add('dismissed');
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 350);
    }, 800);
  }

  // ============================ INIT ============================
  function init() {
    const overlay = buildVault();
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    const skipBtn = overlay.querySelector('#vaultSkipBtn');
    const soundBtn = overlay.querySelector('#vaultSoundBtn');
    const soundLabel = overlay.querySelector('#vaultSoundLabel');

    function dismissNow() {
      overlay.classList.add('dismissed');
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('vault');
        history.replaceState({}, '', url.toString());
      } catch (_) {}
      setTimeout(() => {
        overlay.remove();
        document.body.style.overflow = '';
      }, 400);
    }

    skipBtn.addEventListener('click', dismissNow);

    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundLabel.textContent = soundEnabled ? 'Sound on' : 'Sound off';
      if (soundEnabled) getCtx();
    });

    if (reduced) {
      runReducedMotion(overlay);
      return;
    }

    setTimeout(() => {
      getCtx();
      runSequence(overlay);
    }, 400);

    document.addEventListener('keydown', function onKey(e) {
      if (overlay.classList.contains('dismissed')) {
        document.removeEventListener('keydown', onKey);
        return;
      }
      if (e.key === 'Escape') dismissNow();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
