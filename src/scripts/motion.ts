import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initMotion() {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const splits: SplitText[] = [];
    const headings = document.querySelectorAll<HTMLElement>(
      "[data-text-reveal], main .section-title, .page-hero h1, .contact-band h2",
    );
    headings.forEach((element) => {
      element.removeAttribute("data-reveal");
      element.classList.add("text-motion");
      const split = SplitText.create(element, {
        type: "lines,chars",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
        linesClass: "motion-line",
        charsClass: "motion-char",
        onSplit(self) {
          return gsap.from(self.chars, {
            yPercent: 108,
            rotation: 3,
            opacity: 0,
            duration: 0.95,
            stagger: { amount: Math.min(0.55, self.chars.length * 0.025) },
            ease: "power3.out",
            scrollTrigger: { trigger: element, start: "top 93%", once: true },
            onComplete: () => {
              element.dataset.textComplete = "true";
            },
          });
        },
      });
      splits.push(split);
    });

    document
      .querySelectorAll<HTMLElement>("[data-scroll-fill]")
      .forEach((element) => {
        const split = SplitText.create(element, {
          type: "chars",
          aria: "auto",
          charsClass: "fill-char",
          smartWrap: false,
        });
        splits.push(split);
        gsap.fromTo(
          split.chars,
          { opacity: 0.55 },
          {
            opacity: 1,
            stagger: 0.055,
            ease: "none",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              end: "bottom 46%",
              scrub: 0.5,
            },
          },
        );
      });

    document
      .querySelectorAll<HTMLElement>("[data-reveal]")
      .forEach((element) => {
        // Product cards use CSS translate for the staggered layout and transform
        // for hover. Keep their entrance independent of those positioning rules.
        const isProductCard = element.matches(".product-card");
        gsap.from(element, {
          ...(isProductCard ? {} : { y: 26 }),
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 96%", once: true },
          onComplete: () => {
            gsap.set(element, {
              clearProps: isProductCard ? "opacity" : "transform,opacity",
            });
          },
        });
      });

    const progress = document.querySelector<HTMLElement>(
      "[data-scroll-progress]",
    );
    if (progress)
      gsap.fromTo(
        progress,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { start: 0, end: "max", scrub: 0.15 },
        },
      );
    const topButton = document.querySelector<HTMLElement>(
      "[data-floating-top]",
    );
    if (topButton) {
      topButton.classList.remove("is-visible");
      topButton.inert = true;
    }
    if (topButton)
      ScrollTrigger.create({
        start: 650,
        end: "max",
        onToggle: ({ isActive }) => {
          topButton.classList.toggle("is-visible", isActive);
          topButton.inert = !isActive;
        },
      });
    if (document.querySelector(".footer-wordmark"))
      gsap.from(".footer-wordmark", {
        yPercent: 20,
        opacity: 0,
        duration: 1.25,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer-wordmark",
          start: "top 96%",
          once: true,
        },
      });
    const pointerMedia = gsap.matchMedia();
    pointerMedia.add(
      "(hover: hover) and (pointer: fine) and (min-width: 1024px)",
      () => {
        const listeners: (() => void)[] = [];
        document
          .querySelectorAll<HTMLElement>(".btn .button-icon")
          .forEach((icon) => {
            const control = icon.closest<HTMLElement>(".btn");
            if (!control) return;
            const xTo = gsap.quickTo(icon, "x", {
              duration: 0.45,
              ease: "power3.out",
            });
            const yTo = gsap.quickTo(icon, "y", {
              duration: 0.45,
              ease: "power3.out",
            });
            let bounds: DOMRect;
            const enter = () => {
              bounds = control.getBoundingClientRect();
            };
            const move = (event: PointerEvent) => {
              if (!bounds) return;
              xTo((event.clientX - bounds.left - bounds.width / 2) * 0.08);
              yTo((event.clientY - bounds.top - bounds.height / 2) * 0.12);
            };
            const leave = () => {
              xTo(0);
              yTo(0);
            };
            control.addEventListener("pointerenter", enter);
            control.addEventListener("pointermove", move);
            control.addEventListener("pointerleave", leave);
            listeners.push(() => {
              control.removeEventListener("pointerenter", enter);
              control.removeEventListener("pointermove", move);
              control.removeEventListener("pointerleave", leave);
              gsap.set(icon, { clearProps: "transform" });
            });
          });
        const visual = document.querySelector<HTMLElement>(".trust-visual");
        const scene = visual?.querySelector<HTMLElement>(".trust-scene");
        if (visual && scene) {
          const xTo = gsap.quickTo(scene, "x", {
            duration: 0.9,
            ease: "power3.out",
          });
          const yTo = gsap.quickTo(scene, "y", {
            duration: 0.9,
            ease: "power3.out",
          });
          let bounds: DOMRect;
          const enter = () => {
            bounds = visual.getBoundingClientRect();
          };
          const move = (event: PointerEvent) => {
            if (bounds) {
              xTo((event.clientX - bounds.left - bounds.width / 2) * 0.035);
              yTo((event.clientY - bounds.top - bounds.height / 2) * 0.035);
            }
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          visual.addEventListener("pointerenter", enter);
          visual.addEventListener("pointermove", move);
          visual.addEventListener("pointerleave", leave);
          listeners.push(() => {
            visual.removeEventListener("pointerenter", enter);
            visual.removeEventListener("pointermove", move);
            visual.removeEventListener("pointerleave", leave);
            gsap.set(scene, { clearProps: "transform" });
          });
        }
        return () => listeners.forEach((remove) => remove());
      },
    );
    ScrollTrigger.refresh();
    return () => {
      pointerMedia.revert();
      splits.forEach((split) => split.revert());
      headings.forEach((element) => {
        delete element.dataset.textComplete;
        element.classList.remove("text-motion");
      });
      if (topButton) {
        topButton.classList.add("is-visible");
        topButton.inert = false;
      }
    };
  });
  document.documentElement.dataset.motionReady = "true";
  return () => {
    media.revert();
    delete document.documentElement.dataset.motionReady;
  };
}
