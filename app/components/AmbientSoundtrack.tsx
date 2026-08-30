'use client';

import { useRef, useEffect, useState } from 'react';

export default function AmbientSoundtrack() {
  const [started, setStarted] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const handler = () => {
      if (started) return;
      try {
        const ctx = new AudioContext();
        const masterGain = ctx.createGain();
        masterGain.gain.value = 0;
        masterGain.connect(ctx.destination);

        const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.pow(Math.random(), 0.5);
        }
        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 180;
        lowpass.Q.value = 0.5;

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 40;
        lfo.connect(lfoGain);
        lfoGain.connect(lowpass.frequency);
        lfo.start();

        const droneOsc = ctx.createOscillator();
        droneOsc.type = 'sine';
        droneOsc.frequency.value = 55;
        const droneGain = ctx.createGain();
        droneGain.gain.value = 0.06;

        const droneOsc2 = ctx.createOscillator();
        droneOsc2.type = 'sine';
        droneOsc2.frequency.value = 65.41;
        const droneGain2 = ctx.createGain();
        droneGain2.gain.value = 0.03;

        const droneOsc3 = ctx.createOscillator();
        droneOsc3.type = 'sine';
        droneOsc3.frequency.value = 82.41;
        const droneGain3 = ctx.createGain();
        droneGain3.gain.value = 0.02;

        noiseSource.connect(lowpass);
        lowpass.connect(masterGain);

        droneOsc.connect(droneGain);
        droneGain.connect(masterGain);
        droneOsc2.connect(droneGain2);
        droneGain2.connect(masterGain);
        droneOsc3.connect(droneGain3);
        droneGain3.connect(masterGain);

        droneOsc.start();
        droneOsc2.start();
        droneOsc3.start();
        noiseSource.start();

        masterGain.gain.setValueAtTime(0, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 4);

        ctxRef.current = ctx;
        gainRef.current = masterGain;
        setStarted(true);
      } catch (_) {}
    };

    document.addEventListener('click', handler, { once: true });
    document.addEventListener('touchstart', handler, { once: true });

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchstart', handler);
      if (ctxRef.current) {
        try { ctxRef.current.close(); } catch (_) {}
      }
    };
  }, [started]);

  return null;
}
