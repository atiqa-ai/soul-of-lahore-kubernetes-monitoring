'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { places } from '@/data/places';

interface MediaPlane {
  sprite: THREE.Sprite;
  nameSprite: THREE.Sprite;
  slug: string;
  title: string;
  userData: {
    orbitRadius: number; orbitAngle: number;
  };
}

interface PlacesSceneProps {
  onNavigate: (slug: string) => void;
  onHover: (slug: string | null) => void;
}

export default function PlacesScene({ onNavigate, onHover }: PlacesSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const hoveredSlugRef = useRef<string | null>(null);

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
    let raycaster: THREE.Raycaster;
    let mouse: THREE.Vector2;
    let hoveredSprite: THREE.Sprite | null = null;

    const render = () => {
      if (!isVisible) { animId = 0; return; }
      animId = requestAnimationFrame(render);
      const elapsed = clock.getElapsedTime();

      for (let p = 0; p < planes.length; p++) {
        const { sprite, nameSprite, userData: u } = planes[p];
        u.orbitAngle += 0.002;
        sprite.position.x = Math.cos(u.orbitAngle) * u.orbitRadius;
        sprite.position.y = Math.sin(u.orbitAngle) * u.orbitRadius;
        nameSprite.position.x = sprite.position.x;
        nameSprite.position.y = sprite.position.y - 1.05;

        const isHovered = sprite === hoveredSprite;
        const targetScale = isHovered ? 1.25 : 1;
        sprite.scale.x += (targetScale - sprite.scale.x) * 0.08;
        sprite.scale.y += (targetScale - sprite.scale.y) * 0.08;

        nameSprite.material.opacity = Math.min(nameSprite.material.opacity + 0.02, 0.8);
      }

      raycaster.setFromCamera(mouse, camera);
      const sprites = planes.map(p => p.sprite);
      const intersects = raycaster.intersectObjects(sprites);

      if (intersects.length > 0) {
        const hit = intersects[0].object as THREE.Sprite;
        const plane = planes.find(p => p.sprite === hit);
        if (plane && plane.slug !== hoveredSlugRef.current) {
          hoveredSlugRef.current = plane.slug;
          onHover(plane.slug);
          hoveredSprite = hit;
        }
      } else if (hoveredSprite) {
        hoveredSlugRef.current = null;
        onHover(null);
        hoveredSprite = null;
      }

      const ce = elapsed * 0.04;
      camera.position.x = Math.sin(ce) * 0.35 + Math.sin(elapsed * 0.07) * 0.1;
      camera.position.y = 0.5 + Math.sin(elapsed * 0.03) * 0.15 + Math.sin(elapsed * 0.06) * 0.08;
      camera.position.z = 13 + Math.sin(elapsed * 0.05) * 0.2;
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
      camera.position.set(0, 0.5, 13);

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
      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2(-999, -999);

      const count = places.length;

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

      const createCircularLogoTexture = (src: string, fallback: string): Promise<THREE.CanvasTexture> => {
        return new Promise((resolve) => {
          const size = 256;
          const cx = size / 2, cy = size / 2, radius = size / 2 - 6;
          const buildCanvas = (drawContent: (ctx: CanvasRenderingContext2D) => void) => {
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            ctx.save();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.clip();
            drawContent(ctx);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = '#D4A853';
            ctx.lineWidth = 4;
            ctx.shadowColor = 'rgba(212, 168, 83, 0.6)';
            ctx.shadowBlur = 12;
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(cx, cy, radius - 8, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(212, 168, 83, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
            return canvas;
          };
          const makeFallback = () => {
            const canvas = buildCanvas((ctx) => {
              ctx.fillStyle = '#1a1a2e';
              ctx.fillRect(0, 0, size, size);
              ctx.font = 'bold 110px Arial,sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#D4A853';
              ctx.fillText(fallback, cx, cy + 4);
            });
            const tex = new THREE.CanvasTexture(canvas);
            tex.colorSpace = THREE.SRGBColorSpace;
            resolve(tex);
          };
          let attempts = 0;
          const maxAttempts = 3;
          const load = () => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
              try {
                const canvas = buildCanvas((ctx) => {
                  const s = Math.min(img.width, img.height);
                  ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
                });
                const tex = new THREE.CanvasTexture(canvas);
                tex.colorSpace = THREE.SRGBColorSpace;
                resolve(tex);
              } catch (_) {
                if (attempts < maxAttempts) {
                  attempts++;
                  setTimeout(load, 700 * attempts);
                } else {
                  makeFallback();
                }
              }
            };
            img.onerror = () => {
              if (attempts < maxAttempts) {
                attempts++;
                setTimeout(load, 700 * attempts);
              } else {
                makeFallback();
              }
            };
            img.src = src;
          };
          load();
        });
      };

      const orbitRadius = 5.0;
      const logoScale = 1.0;

      const createNameTexture = (text: string): THREE.CanvasTexture => {
        const c = document.createElement('canvas');
        c.width = 1024;
        c.height = 192;
        const ctx = c.getContext('2d')!;
        ctx.clearRect(0, 0, 1024, 192);
        ctx.font = 'bold 71px Arial,Helvetica,sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#D4A853';
        ctx.fillText(text, 512, 96);
        const tex = new THREE.CanvasTexture(c);
        tex.colorSpace = THREE.SRGBColorSpace;
        return tex;
      };

      places.forEach((place, i) => {
        const angle = (i / count) * Math.PI * 2;
        const x = Math.cos(angle) * orbitRadius;
        const y = Math.sin(angle) * orbitRadius;

        const makeLogo = (texture: THREE.Texture) => {
          const mat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          });
          const sprite = new THREE.Sprite(mat);
          sprite.position.set(x, y, 0);
          sprite.scale.set(logoScale, logoScale, 1);

          const nameTex = createNameTexture(place.title);
          const nameMat = new THREE.SpriteMaterial({
            map: nameTex,
            transparent: true,
            opacity: 0,
            depthWrite: false,
          });
          const nameSprite = new THREE.Sprite(nameMat);
          nameSprite.position.set(x, y - 1.05, 0);
          nameSprite.scale.set(2.8, 0.72, 1);
          group.add(nameSprite);
          fadeIn(nameMat, 'opacity', 0.8, 1);

          planes.push({
            sprite,
            nameSprite,
            slug: place.slug,
            title: place.title,
            userData: {
              orbitRadius,
              orbitAngle: angle,
            },
          });
          group.add(sprite);
          fadeIn(mat, 'opacity', 0.9, 0.8 + Math.random() * 0.4);
        };

        const mediaItem = place.media.find(m => m.type === 'image');
        const src = mediaItem?.src || '';
        const fallbackLetter = place.title.charAt(0);
        if (src) {
          createCircularLogoTexture(src, fallbackLetter).then(makeLogo);
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

      const onMouseMove = (e: MouseEvent) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      };
      window.addEventListener('mousemove', onMouseMove);

      const onClick = () => {
        if (hoveredSlugRef.current) {
          onNavigate(hoveredSlugRef.current);
        }
      };
      window.addEventListener('click', onClick);

      return () => {
        cancelAnimationFrame(animId);
        observer.disconnect();
        window.removeEventListener('resize', onResize);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('click', onClick);
        renderer.dispose();
        planes.forEach(p => {
          const sm = p.sprite.material as THREE.SpriteMaterial;
          if (sm.map) sm.map.dispose();
          sm.dispose();
          const nm = p.nameSprite.material as THREE.SpriteMaterial;
          if (nm.map) nm.map.dispose();
          nm.dispose();
        });
        if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      };
    } catch (_) {
      observer.disconnect();
    }
  }, [onNavigate, onHover]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen bg-black overflow-hidden"
      style={{ height: '100dvh' }}
    >
      <div ref={containerRef} className="absolute inset-0" />
    </section>
  );
}
