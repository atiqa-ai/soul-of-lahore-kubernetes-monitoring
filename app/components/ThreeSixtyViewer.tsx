'use client';

import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { MediaItem } from '@/data/places';
import { ZONE_LABELS } from '@/data/places';

interface ThreeSixtyViewerProps {
  items: MediaItem[];
}

interface MediaPlane {
  mesh: THREE.Mesh;
  idx: number;
  userData: {
    floatSpeed: number; floatOffset: number; floatAmplitude: number;
    rotYSpeed: number; rotYOffset: number; rotYAmplitude: number;
    rotXSpeed: number; rotXOffset: number; rotXAmplitude: number;
    orbitRadius: number; orbitAngle: number;
    zDriftSpeed: number; zDriftOffset: number; zDriftAmplitude: number;
    baseY: number; baseX: number; baseZ: number;
  };
}

export default function ThreeSixtyViewer({ items }: ThreeSixtyViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const [descText, setDescText] = useState(items[0]?.description || '');
  const [zoneLabel, setZoneLabel] = useState(items[0]?.zone ? ZONE_LABELS[items[0].zone] : '');
  const [isDragging, setIsDragging] = useState(false);
  const descTextRef = useRef(descText);
  const zoneLabelRef = useRef(zoneLabel);
  const count = items.length;

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;
    if (!container) return;

    let isVisible = true;
    let animId = 0;
    let scene: THREE.Scene;
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.WebGLRenderer;
    let controls: OrbitControls;
    let group: THREE.Group;
    let particles: THREE.Points;
    let clock: THREE.Clock;
    let planes: MediaPlane[];
    let autoRotateTimeout: ReturnType<typeof setTimeout>;

    const render = () => {
      if (!isVisible) { animId = 0; return; }
      animId = requestAnimationFrame(render);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      const halfAngle = Math.PI / count;
      for (let p = 0; p < planes.length; p++) {
        const { mesh, userData: u } = planes[p];
        const ef = elapsed * u.floatSpeed + u.floatOffset;
        mesh.position.y = u.baseY + Math.sin(ef) * u.floatAmplitude;
        mesh.rotation.y += Math.sin(elapsed * u.rotYSpeed + u.rotYOffset) * u.rotYAmplitude * 0.015;
        mesh.rotation.x = Math.sin(elapsed * u.rotXSpeed + u.rotXOffset) * u.rotXAmplitude;
        const zd = Math.sin(elapsed * u.zDriftSpeed + u.zDriftOffset) * u.zDriftAmplitude;
        const cAngle = u.orbitAngle + group.rotation.y;
        mesh.position.x = Math.sin(cAngle) * (u.orbitRadius + zd * 0.3);
        mesh.position.z = Math.cos(cAngle) * (u.orbitRadius + zd * 0.3);

        const normAngle = ((cAngle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
        const frontness = Math.max(0, 1 - Math.min(normAngle, Math.PI * 2 - normAngle) / halfAngle);
        const mat = mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 0.3 + frontness * 0.7;
        mesh.scale.setScalar(0.5 + frontness * 0.5);
      }

      if (!isDragging) {
        controls.update();
      }

      let closestIdx = 0;
      let closestDist = Infinity;
      for (let p = 0; p < planes.length; p++) {
        const angle = ((planes[p].userData.orbitAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const dist = Math.min(angle, Math.PI * 2 - angle);
        if (dist < closestDist) { closestDist = dist; closestIdx = planes[p].idx; }
      }

      if (closestDist < 0.15) {
        const newDesc = items[closestIdx].description;
        const newZone = items[closestIdx].zone ? ZONE_LABELS[items[closestIdx].zone] : '';
        if (newDesc !== descTextRef.current) {
          descTextRef.current = newDesc;
          zoneLabelRef.current = newZone;
          setDescText(newDesc);
          setZoneLabel(newZone);
        }
      }

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
      camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
      camera.position.set(0, 0.5, 8);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.inset = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.8;
      controls.minDistance = 3;
      controls.maxDistance = 15;
      controls.maxPolarAngle = Math.PI / 2.2;
      controls.minPolarAngle = Math.PI / 6;
      controls.target.set(0, 0, 0);

      controls.addEventListener('start', () => {
        setIsDragging(true);
        controls.autoRotate = false;
        clearTimeout(autoRotateTimeout);
      });

      controls.addEventListener('end', () => {
        autoRotateTimeout = setTimeout(() => {
          controls.autoRotate = true;
          setIsDragging(false);
        }, 3000);
      });

      scene.fog = new THREE.FogExp2(new THREE.Color(0x050505), 0.018);

      const lowPower = window.devicePixelRatio < 2 || /Android|iPhone|iPad/i.test(navigator.userAgent);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 1.5));

      const particleCount = lowPower ? 80 : 200;
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
        new THREE.PointsMaterial({ color: 0xffffff, size: 0.015, transparent: true, opacity: 0.25 })
      );
      scene.add(particles);

      group = new THREE.Group();
      scene.add(group);

      planes = [];
      const textureLoader = new THREE.TextureLoader();

      const fadeIn = (obj: any, prop: string, target: number, dur: number) => {
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

      items.forEach((item, i) => {
        const angle = (i / count) * Math.PI * 2 + Math.PI * 0.5;
        const r = 5.5 + (Math.random() - 0.5) * 1.5;
        const y = (Math.random() - 0.5) * 2.5;
        const maxW = 2.4;
        const maxH = 2.4;

        const makePlane = (texture: THREE.Texture, aspect: number) => {
          let w = maxW, h = maxW / aspect;
          if (h > maxH) { h = maxH; w = h * aspect; }
          const geo = new THREE.PlaneGeometry(w, h);
          const mat = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, transparent: true, opacity: 0, depthWrite: false });
          const mesh = new THREE.Mesh(geo, mat);
          mesh.position.set(Math.sin(angle) * r, y, Math.cos(angle) * r);
          mesh.rotation.x = (Math.random() - 0.5) * 0.1;
          mesh.rotation.y = Math.random() * 0.12;
          mesh.rotation.z = (Math.random() - 0.5) * 0.06;

          planes.push({
            mesh, idx: i,
            userData: {
              floatSpeed: 0.12 + Math.random() * 0.2, floatOffset: Math.random() * Math.PI * 2, floatAmplitude: 0.08 + Math.random() * 0.12,
              rotYSpeed: 0.08 + Math.random() * 0.12, rotYOffset: Math.random() * Math.PI * 2, rotYAmplitude: 0.012 + Math.random() * 0.02,
              rotXSpeed: 0.08 + Math.random() * 0.1, rotXOffset: Math.random() * Math.PI * 2, rotXAmplitude: 0.006 + Math.random() * 0.012,
              orbitRadius: r, orbitAngle: angle,
              zDriftSpeed: 0.06 + Math.random() * 0.1, zDriftOffset: Math.random() * Math.PI * 2, zDriftAmplitude: 0.1 + Math.random() * 0.15,
              baseY: y, baseX: Math.sin(angle) * r, baseZ: Math.cos(angle) * r,
            },
          });
          group.add(mesh);
          fadeIn(mat, 'opacity', 0.85, 0.8 + Math.random() * 0.4);
        };

        if (item.type === 'image') {
          textureLoader.load(item.src, (tex) => {
            try { tex.colorSpace = THREE.SRGBColorSpace; makePlane(tex, tex.image.width / tex.image.height); } catch (_) {}
          });
        } else {
          const video = document.createElement('video');
          video.src = item.src;
          video.muted = true;
          video.loop = true;
          video.playsInline = true;
          video.crossOrigin = 'anonymous';
          video.preload = 'metadata';
          video.style.display = 'none';
          document.body.appendChild(video);
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
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        cancelAnimationFrame(animId);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        controls.dispose();
        renderer.dispose();
        clearTimeout(autoRotateTimeout);
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
  }, [items, count]);

  return (
    <div ref={sectionRef} className="absolute inset-0 bg-black overflow-hidden">
      <div ref={containerRef} className="absolute inset-0" />

      <div className="absolute inset-0 pointer-events-none z-[2]" style={{
        background: 'radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.35) 70%, rgba(0,0,0,0.65) 100%)',
      }} />

      <div ref={zoneRef} className="absolute top-6 md:top-10 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-lg shadow-amber-500/5">
          <span className="text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/70">
            {zoneLabel}
          </span>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/30 backdrop-blur-md">
          <svg className="w-3 h-3 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="text-[8px] tracking-[0.2em] uppercase text-white/30">
            {isDragging ? 'Release to pause auto-rotate' : 'Drag to explore 360'}
          </span>
        </div>
      </div>

      <div ref={descRef} className="absolute bottom-12 md:bottom-16 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center px-8 max-w-3xl w-full">
        <p className="text-sm md:text-base lg:text-lg text-white/80 leading-relaxed tracking-wide font-light [text-shadow:_0_2px_12px_rgba(0,0,0,0.5)]">
          {descText}
        </p>
      </div>
    </div>
  );
}
