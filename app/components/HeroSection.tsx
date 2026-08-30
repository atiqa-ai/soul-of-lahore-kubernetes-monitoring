'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import * as THREE from 'three';
import ParticleField from './ParticleField';
import SoulOfLahoreLogo from './SoulOfLahoreLogo';
import { homeMedia } from '@/data/places';

export default function HeroSection() {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const chaosOverlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const logoWrapRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const separatorRef = useRef<HTMLDivElement>(null);

  // Three.js 360° orbiting media background
  useEffect(() => {
    const container = mediaRef.current;
    if (!container) return;

    let isVisible = true;
    let animId = 0;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let group: THREE.Group;
    let particles: THREE.Points;
    let clock: THREE.Clock;
    let isDragging = false;
    let prevPointerX = 0;
    let dragVelocity = 0;
    let sectionVisible = true;
    const sectionObserver = new IntersectionObserver(([entry]) => {
      sectionVisible = entry.isIntersecting;
      if (sectionVisible && !animId) {
        clock = new THREE.Clock();
        render();
      }
    }, { threshold: 0.01 });
    if (sectionRef.current) sectionObserver.observe(sectionRef.current);
    let planes: { mesh: THREE.Mesh; userData: any }[];
    let videoElements: HTMLVideoElement[];

    const render = () => {
      if (!isVisible || !sectionVisible) { animId = 0; return; }
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      if (isDragging) {
        // no auto-rotation during drag
      } else {
        group.rotation.y += 0.003;
        if (dragVelocity !== 0) {
          group.rotation.y += dragVelocity;
          dragVelocity *= 0.97;
          if (Math.abs(dragVelocity) < 0.00005) dragVelocity = 0;
        }
      }

      for (let p = 0; p < planes.length; p++) {
        const { mesh, userData: u } = planes[p];
        const ef = elapsed * u.floatSpeed + u.floatOffset;
        const efSin = Math.sin(ef);
        mesh.position.y = u.baseY + efSin * u.floatAmplitude;
        mesh.rotation.y += Math.sin(elapsed * u.rotYSpeed + u.rotYOffset) * u.rotYAmplitude * 0.015;
        mesh.rotation.x = Math.sin(elapsed * u.rotXSpeed + u.rotXOffset) * u.rotXAmplitude;
        const zd = Math.sin(elapsed * u.zDriftSpeed + u.zDriftOffset) * u.zDriftAmplitude;
        const cAngle = u.orbitAngle + group.rotation.y;
        const cSin = Math.sin(cAngle);
        const cCos = Math.cos(cAngle);
        mesh.position.x = cSin * (u.orbitRadius + zd * 0.3);
        mesh.position.z = cCos * (u.orbitRadius + zd * 0.3);
      }

      const ce = elapsed * 0.04;
      camera.position.x = Math.sin(ce) * 0.25 + Math.sin(elapsed * 0.07) * 0.12;
      camera.position.y = 0.3 + Math.sin(elapsed * 0.03) * 0.15 + Math.sin(elapsed * 0.06) * 0.08;
      camera.position.z = 7 + Math.sin(elapsed * 0.05) * 0.2;
      camera.lookAt(0, 0, 0);
      particles.rotation.y += 0.0003;
      renderer.render(scene, camera);
    };

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);

      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0.3, 7);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      scene.fog = new THREE.FogExp2(new THREE.Color(0x050505), 0.018);

      const lowPower = window.devicePixelRatio < 2 || /Android|iPhone|iPad/i.test(navigator.userAgent);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1));

      const particleCount = lowPower ? 100 : 250;
      const particleGeo = new THREE.BufferGeometry();
      const particlePos = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        particlePos[i * 3] = (Math.random() - 0.5) * 40;
        particlePos[i * 3 + 1] = (Math.random() - 0.5) * 20;
        particlePos[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;
      }
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePos, 3));
      particles = new THREE.Points(
        particleGeo,
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.02, transparent: true, opacity: 0.3 })
      );
      scene.add(particles);

      group = new THREE.Group();
      scene.add(group);

      planes = [];
      videoElements = [];
      const textureLoader = new THREE.TextureLoader();
      const mediaItems = homeMedia;
      const count = mediaItems.length;

      const gsapTo = (obj: any, prop: string, target: number, dur: number) => {
        const start = obj[prop];
        if (start === undefined) return;
        const t0 = performance.now();
        const upd = () => {
          const t = Math.min((performance.now() - t0) / (dur * 1000), 1);
          const e = 1 - Math.pow(1 - t, 3);
          obj[prop] = start + (target - start) * e;
          if (t < 1) requestAnimationFrame(upd);
        };
        requestAnimationFrame(upd);
      };

      mediaItems.forEach((item, i) => {
        const angle = (i / count) * Math.PI * 2;
        const r = 4.8 + (Math.random() - 0.5) * 1.2;
        const x = Math.sin(angle) * r;
        const z = Math.cos(angle) * r;
        const y = (Math.random() - 0.5) * 2.8;
        const maxW = 1.6;
        const maxH = 1.6;

        const makePlane = (texture: THREE.Texture, aspect: number) => {
          let w: number, h: number;
          if (aspect >= 1) {
            w = maxW; h = maxW / aspect;
            if (h > maxH) { h = maxH; w = h * aspect; }
          } else {
            h = maxH; w = maxH * aspect;
            if (w > maxW) { w = maxW; h = w / aspect; }
          }
          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshBasicMaterial({
            map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false,
          });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(x, y, z);
          mesh.rotation.x = (Math.random() - 0.5) * 0.08;
          mesh.rotation.y = Math.random() * 0.1;
          mesh.rotation.z = (Math.random() - 0.5) * 0.05;

          planes.push({
            mesh,
            userData: {
              floatSpeed: 0.15 + Math.random() * 0.25, floatOffset: Math.random() * Math.PI * 2, floatAmplitude: 0.08 + Math.random() * 0.12,
              rotYSpeed: 0.08 + Math.random() * 0.15, rotYOffset: Math.random() * Math.PI * 2, rotYAmplitude: 0.015 + Math.random() * 0.025,
              rotXSpeed: 0.1 + Math.random() * 0.12, rotXOffset: Math.random() * Math.PI * 2, rotXAmplitude: 0.008 + Math.random() * 0.015,
              orbitRadius: r, orbitAngle: angle,
              zDriftSpeed: 0.08 + Math.random() * 0.12, zDriftOffset: Math.random() * Math.PI * 2, zDriftAmplitude: 0.15 + Math.random() * 0.2,
              baseY: y, baseX: x, baseZ: z,
            },
          });
          group.add(mesh);
          gsapTo(mat, 'opacity', 0.85, 0.8 + Math.random() * 0.4);
        };

        if (item.type === 'image') {
          const loadImage = (retry = 0) => {
            textureLoader.load(item.src, (tex) => {
              try {
                tex.colorSpace = THREE.SRGBColorSpace;
                makePlane(tex, tex.image.width / tex.image.height);
              } catch (_) {}
            }, undefined, () => {
              if (retry < 3) setTimeout(() => loadImage(retry + 1), 700 * (retry + 1));
            });
          };
          loadImage();
        } else if (item.type === 'video') {
          const attemptVideo = (attempt: number) => {
            const video = document.createElement('video');
            video.src = item.src;
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            video.crossOrigin = 'anonymous';
            video.preload = 'none';
            video.style.display = 'none';
            document.body.appendChild(video);
            videoElements.push(video);

            video.addEventListener('canplay', () => {
              try {
                const tex = new THREE.VideoTexture(video);
                tex.colorSpace = THREE.SRGBColorSpace;
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                makePlane(tex, video.videoWidth / video.videoHeight || 16 / 9);
                video.play().catch(() => {});
              } catch (_) {}
            });

            video.addEventListener('error', () => {
              video.pause();
              video.removeAttribute('src');
              video.load();
              const idx = videoElements.indexOf(video);
              if (idx >= 0) videoElements.splice(idx, 1);
              if (video.parentNode) video.parentNode.removeChild(video);
              if (attempt < 3) setTimeout(() => attemptVideo(attempt + 1), 700 * (attempt + 1));
            }, { once: true });

            video.load();
          };
          attemptVideo(0);
        }
      });

      clock = new THREE.Clock();
      render();

      const onResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      const canvas = renderer.domElement;
      canvas.style.touchAction = 'pan-y';

      const onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevPointerX = e.clientX;
      };
      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - prevPointerX;
        prevPointerX = e.clientX;
        group.rotation.y += dx * 0.008;
        dragVelocity = dx * 0.008;
      };
      const onPointerUp = (_e: PointerEvent) => {
        isDragging = false;
      };
      canvas.addEventListener('pointerdown', onPointerDown);
      canvas.addEventListener('pointermove', onPointerMove);
      canvas.addEventListener('pointerup', onPointerUp);
      canvas.addEventListener('pointerleave', onPointerUp);

      const onWheel = (e: WheelEvent) => {
        if (e.deltaX !== 0) {
          e.preventDefault();
          group.rotation.y += e.deltaX * 0.005;
          dragVelocity = e.deltaX * 0.005;
        }
      };
      canvas.addEventListener('wheel', onWheel, { passive: false });

      return () => {
        cancelAnimationFrame(animId);
        sectionObserver.disconnect();
        window.removeEventListener('resize', onResize);
        canvas.removeEventListener('pointerdown', onPointerDown);
        canvas.removeEventListener('pointermove', onPointerMove);
        canvas.removeEventListener('pointerup', onPointerUp);
        canvas.removeEventListener('pointerleave', onPointerUp);
        canvas.removeEventListener('wheel', onWheel);
        renderer.dispose();
        videoElements.forEach(v => { v.pause(); v.remove(); });
        planes.forEach(p => {
          p.mesh.geometry.dispose();
          const mats = Array.isArray(p.mesh.material) ? p.mesh.material : [p.mesh.material];
          mats.forEach(m => {
            const mat = m as THREE.MeshBasicMaterial;
            if (mat.map) mat.map.dispose();
            mat.dispose();
          });
        });
        if (container.contains(canvas)) container.removeChild(canvas);
      };
    } catch (_) {}
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      if (logoWrapRef.current) {
        tl.fromTo(logoWrapRef.current, { autoAlpha: 0, y: 50, scale: 0.8 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 2.2, ease: 'power3.out' });
      }

      if (taglineRef.current) {
        tl.fromTo(taglineRef.current, { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 1.8 }, '-=1.2');
      }

      if (ctaRef.current) {
        tl.fromTo(ctaRef.current, { autoAlpha: 0, y: 15, scale: 0.93 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 1.6, ease: 'power3.out' }, '-=0.8');
      }

      if (separatorRef.current) {
        tl.fromTo(separatorRef.current, { scaleX: 0, autoAlpha: 0 },
          { scaleX: 1, autoAlpha: 1, duration: 2, ease: 'power3.inOut' }, '-=1');
      }

      // Content fades on scroll
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          y: -150, scale: 0.92, opacity: 0, ease: 'power2.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
        });
      }

      // Background zoom (more dramatic)
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          scale: 1.15, ease: 'power1.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
        });
      }

      // Overlay intensifies
      if (overlayRef.current) {
        gsap.to(overlayRef.current, {
          opacity: 0.5, ease: 'power1.inOut',
          scrollTrigger: { trigger: sectionRef.current, start: 'top top', end: 'bottom top', scrub: 2 },
        });
      }

      // Chaos overlay — random pulsing intensity
      if (chaosOverlayRef.current) {
        gsap.to(chaosOverlayRef.current, {
          opacity: 0.15, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: -1,
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden" style={{ minHeight: '100dvh' }}>
      {/* Three.js 360° orbiting media background — cinematic rotation of all media */}
      <div ref={bgRef} className="absolute inset-0 w-full h-full will-change-transform">
        <div ref={mediaRef} className="absolute inset-0" />
      </div>

      {/* Main gradient overlays */}
      <div ref={overlayRef} className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/5 to-black/40 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 z-[1]" />

      {/* Chaos overlay — pulsing vignette & grain */}
      <div ref={chaosOverlayRef} className="absolute inset-0 z-[2] pointer-events-none opacity-0 mix-blend-overlay">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 30%, rgba(0,0,0,0.4) 100%)',
        }} />
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'6\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.15\'/%3E%3C/svg%3E")',
          backgroundSize: '180px 180px',
        }} />
      </div>

      {/* Dynamic light rays — chaotic movement */}
      <div className="absolute inset-0 overflow-hidden z-[3] pointer-events-none">
        <div className="absolute top-[-40%] left-[-20%] w-[120%] h-[200%] bg-gradient-to-r from-transparent via-amber-500/5 to-transparent"
          style={{ transform: 'rotate(20deg)', animation: 'chaosRay1 6s ease-in-out infinite' }} />
        <div className="absolute top-[-30%] right-[-20%] w-[100%] h-[180%] bg-gradient-to-l from-transparent via-yellow-500/4 to-transparent"
          style={{ transform: 'rotate(-18deg)', animation: 'chaosRay2 8s ease-in-out infinite 1s' }} />
        <div className="absolute bottom-[-20%] left-[10%] w-[80%] h-[120%] bg-gradient-to-t from-transparent via-amber-500/3 to-transparent"
          style={{ transform: 'rotate(8deg)', animation: 'chaosRay3 10s ease-in-out infinite 3s' }} />
        <div className="absolute top-[20%] left-[-10%] w-[60%] h-[80%] bg-gradient-to-r from-transparent via-rose-500/3 to-transparent"
          style={{ transform: 'rotate(-25deg)', animation: 'chaosRay4 7s ease-in-out infinite 2s' }} />
      </div>

      {/* Floating particles — increased density */}
      <ParticleField />

      {/* Center content */}
      <div ref={contentRef} className="absolute inset-0 z-[5] flex flex-col items-center justify-center px-4">
        <div ref={logoWrapRef} className="mb-6 md:mb-8 text-center">
          <SoulOfLahoreLogo size={96} variant="hero" />
          <div className="mt-4">
            <span className="text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/40 block">
              A Cinematic Documentary
            </span>
          </div>
        </div>

        <h1 className="text-center mb-4 md:mb-6 max-w-4xl">
          <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none mb-2">
            <span className="text-gold">SOUL</span>
          </span>
          <span className="block text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.15em] leading-none text-white/90 mb-2">
            OF
          </span>
          <span className="block text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-none">
            <span className="text-gold">LAHORE</span>
          </span>
        </h1>

        <div ref={separatorRef}
          className="w-24 md:w-32 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent mb-4 md:mb-5 origin-center"
        />

        <p ref={taglineRef} className="text-sm md:text-lg font-light italic text-white/60 text-center max-w-xl mb-6 md:mb-8">
          &ldquo;Every Brick Tells A Story.&rdquo;
        </p>
      </div>

      {/* CTA button — positioned independently so scroll parallax doesn't move it */}
      <div ref={ctaRef} className="absolute bottom-[8%] left-1/2 -translate-x-1/2 z-[5]">
        <button onClick={() => router.push('/places')} className="cta-button group">
          <span>Enter the Soul</span>
          <svg className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes chaosRay1 {
          0%, 100% { transform: rotate(20deg) translateX(0); opacity: 0.3; }
          25% { transform: rotate(22deg) translateX(5%); opacity: 0.6; }
          75% { transform: rotate(18deg) translateX(-5%); opacity: 0.4; }
        }
        @keyframes chaosRay2 {
          0%, 100% { transform: rotate(-18deg) translateX(0); opacity: 0.2; }
          30% { transform: rotate(-15deg) translateX(-8%); opacity: 0.5; }
          70% { transform: rotate(-21deg) translateX(8%); opacity: 0.3; }
        }
        @keyframes chaosRay3 {
          0%, 100% { transform: rotate(8deg) translateY(0); opacity: 0.15; }
          40% { transform: rotate(12deg) translateY(-10%); opacity: 0.4; }
          60% { transform: rotate(5deg) translateY(10%); opacity: 0.25; }
        }
        @keyframes chaosRay4 {
          0%, 100% { transform: rotate(-25deg) translateX(0); opacity: 0.1; }
          35% { transform: rotate(-28deg) translateX(10%); opacity: 0.35; }
          80% { transform: rotate(-22deg) translateX(-10%); opacity: 0.2; }
        }
      `}</style>
    </section>
  );
}
