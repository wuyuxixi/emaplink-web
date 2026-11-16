import { gsap } from 'gsap';

/** Called inside the existing reduced-motion GSAP context; no global scroll listeners. */
export function initHomeDecoration() {
  const body = document.querySelector<HTMLElement>('.home-page');
  if (!body) return () => {};
  body.dataset.trustMotion = 'true';

  const decorations = body.querySelectorAll<HTMLElement>('[data-home-decoration]');
  decorations.forEach((decoration) => {
    const section = decoration.closest<HTMLElement>('[data-trust-section]');
    const art = decoration.querySelector<SVGSVGElement>('.trust-artwork');
    if (!section || !art) return;
    gsap.fromTo(art, { opacity: 0.35 }, {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: { trigger: section, start: 'top 94%', once: true },
    });

    if (decoration.dataset.homeDecoration === 'ecosystem') {
      // This short convergence plays once; scrolling paths elsewhere stay native CSS.
      gsap.fromTo(decoration.querySelectorAll('.trust-route-signal'), {
        strokeDashoffset: 1,
      }, {
        strokeDashoffset: 0,
        duration: 1.2,
        stagger: 0.16,
        ease: 'power2.out',
        scrollTrigger: { trigger: section, start: 'top 85%', once: true },
      });
    }
  });

  const pointerMedia = gsap.matchMedia();
  pointerMedia.add('(hover: hover) and (pointer: fine) and (min-width: 1024px)', () => {
    const removers: (() => void)[] = [];
    body.querySelectorAll<HTMLElement>(
      '[data-home-decoration="hero"], [data-home-decoration="contact"]',
    ).forEach((decoration) => {
      const section = decoration.closest<HTMLElement>('[data-trust-section]');
      const layer = decoration.querySelector<HTMLElement>('.trust-pointer-layer');
      if (!section || !layer) return;
      const xTo = gsap.quickTo(layer, 'x', { duration: 0.8, ease: 'power3.out' });
      const yTo = gsap.quickTo(layer, 'y', { duration: 0.8, ease: 'power3.out' });
      const move = (event: PointerEvent) => {
        const bounds = section.getBoundingClientRect();
        const normalize = (position: number, start: number, size: number) =>
          Math.max(-1, Math.min(1, ((position - start) / size - 0.5) * 2));
        xTo(normalize(event.clientX, bounds.left, bounds.width) * -12);
        yTo(normalize(event.clientY, bounds.top, bounds.height) * -12);
      };
      const leave = () => { xTo(0); yTo(0); };
      section.addEventListener('pointermove', move);
      section.addEventListener('pointerleave', leave);
      removers.push(() => {
        section.removeEventListener('pointermove', move);
        section.removeEventListener('pointerleave', leave);
      });
    });
    return () => removers.forEach((remove) => remove());
  });

  return () => {
    pointerMedia.revert();
    delete body.dataset.trustMotion;
  };
}
