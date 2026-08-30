'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { homeMedia } from '@/data/places';

interface MediaPlane {
  mesh: THREE.Mesh;
  userData: {
    floatSpeed: number;
    floatOffset: number;
    floatAmplitude: number;
    rotYSpeed: number;
    rotYOffset: number;
    rotYAmplitude: number;
    rotXSpeed: number;
    rotXOffset: number;
    rotXAmplitude: number;
    orbitRadius: number;
    orbitAngle: number;
    zDriftSpeed: number;
    zDriftOffset: number;
    zDriftAmplitude: number;
    baseY: number;
    baseX: number;
    baseZ: number;
  };
}

export default function CinematicMediaWall() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container) return;

    let isVisible = true;
    let animId = 0;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let group: THREE.Group;
    let particles: THREE.Points;
    let clock: THREE.Clock;
    let planes: MediaPlane[];
    let videoElements: HTMLVideoElement[];

    const render = () => {
      if (!isVisible) { animId = 0; return; }
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      group.rotation.y += 0.003;

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

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible && !animId) {
        clock = new THREE.Clock();
        render();
      }
    }, { threshold: 0.01 });
    if (section) observer.observe(section);

    try {
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x050505);

      camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0.3, 7);

      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      scene.fog = new THREE.FogExp2(new THREE.Color(0x050505), 0.018);

      const lowPower = window.devicePixelRatio < 2 || /Android|iPhone|iPad/i.test(navigator.userAgent);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));

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

          const plane: MediaPlane = {
            mesh,
            userData: {
              floatSpeed: 0.15 + Math.random() * 0.25, floatOffset: Math.random() * Math.PI * 2, floatAmplitude: 0.08 + Math.random() * 0.12,
              rotYSpeed: 0.08 + Math.random() * 0.15, rotYOffset: Math.random() * Math.PI * 2, rotYAmplitude: 0.015 + Math.random() * 0.025,
              rotXSpeed: 0.1 + Math.random() * 0.12, rotXOffset: Math.random() * Math.PI * 2, rotXAmplitude: 0.008 + Math.random() * 0.015,
              orbitRadius: r, orbitAngle: angle,
              zDriftSpeed: 0.08 + Math.random() * 0.12, zDriftOffset: Math.random() * Math.PI * 2, zDriftAmplitude: 0.15 + Math.random() * 0.2,
              baseY: y, baseX: x, baseZ: z,
            },
          };
          group.add(mesh);
          planes.push(plane);
          gsapTo(mat, 'opacity', 0.85, 0.8 + Math.random() * 0.4);
        };

        if (item.type === 'image') {
          textureLoader.load(item.src, (tex) => {
            try {
              tex.colorSpace = THREE.SRGBColorSpace;
              makePlane(tex, tex.image.width / tex.image.height);
            } catch (_) {}
          });
        } else if (item.type === 'video') {
          const video = document.createElement('video');
          video.src = item.src;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          video.preload = 'metadata';
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
          video.load();
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

      return () => {
        cancelAnimationFrame(animId);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
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
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    } catch (_) {
      observer.disconnect();
    }
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen bg-black overflow-hidden" style={{ height: '100dvh' }}>
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none z-[2]">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 85%, rgba(0,0,0,0.85) 100%)',
        }} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-[3] pointer-events-none px-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40" />
            <div className="h-px w-8 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-[0.04em] text-white mb-5 leading-none">
            <span className="bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
              SOUL OF
            </span>
            <br />
            <span className="text-gold">LAHORE</span>
          </h1>

          <div className="divider-gold w-16 md:w-24 mx-auto my-5 md:my-6" />

          <p className="text-sm sm:text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed tracking-wide font-light">
            Step Beyond the Ordinary. Discover the Timeless Soul of Lahore.
          </p>

          {/* Explore Places button */}
          <div className="mt-8 pointer-events-auto">
            <a
              href="/places"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-full border border-amber-500/30 bg-amber-500/5 backdrop-blur-md text-amber-300/90 text-xs tracking-[0.3em] uppercase transition-all duration-500 hover:bg-amber-500/15 hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-500/10 hover:scale-105"
            >
              <span>Explore Places</span>
              <svg className="w-3.5 h-3.5 transition-transform duration-500 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
