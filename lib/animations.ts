import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function fadeInUp(target: string | HTMLElement, delay = 0, duration = 1.2) {
  return gsap.fromTo(
    target,
    { autoAlpha: 0, y: 60 },
    { autoAlpha: 1, y: 0, duration, delay, ease: 'power3.out' }
  );
}

export function parallaxScroll(target: string | HTMLElement, depth = 0.3) {
  return gsap.to(target, {
    y: () => (1 - depth) * 300,
    ease: 'none',
    scrollTrigger: {
      trigger: target,
      start: 'top bottom',
      end: 'bottom top',
      scrub: 1,
    },
  });
}

export function zoomOnScroll(target: string | HTMLElement, scaleEnd = 1.15) {
  return gsap.fromTo(
    target,
    { scale: 1 },
    {
      scale: scaleEnd,
      ease: 'none',
      scrollTrigger: {
        trigger: target,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1.5,
      },
    }
  );
}

export function revealText(target: string | HTMLElement, delay = 0) {
  return gsap.fromTo(
    target,
    { autoAlpha: 0, y: 40 },
    {
      autoAlpha: 1,
      y: 0,
      duration: 1.5,
      delay,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: target,
        start: 'top 85%',
        end: 'top 40%',
        scrub: 1,
      },
    }
  );
}

export function sceneEntrance(target: string | HTMLElement, from: 'left' | 'right' | 'up' = 'up') {
  const xVal = from === 'left' ? -200 : from === 'right' ? 200 : 0;
  const yVal = from === 'up' ? 80 : 0;
  return gsap.fromTo(
    target,
    { autoAlpha: 0, x: xVal, y: yVal },
    {
      autoAlpha: 1, x: 0, y: 0,
      duration: 1.8,
      ease: 'power4.out',
      scrollTrigger: {
        trigger: target,
        start: 'top 85%',
        end: 'top 30%',
        scrub: 1.2,
      },
    }
  );
}