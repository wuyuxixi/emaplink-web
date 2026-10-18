import { gsap } from "gsap";

export function initZsacSceneMotion() {
  const media = gsap.matchMedia();
  media.add("(prefers-reduced-motion: no-preference)", () => {
    const cleanups: (() => void)[] = [];
    document
      .querySelectorAll<HTMLElement>("[data-zsac-scene]")
      .forEach((scene) => {
        const layers = Array.from(
          scene.querySelectorAll<HTMLElement>("[data-zsac-layer]"),
        );
        const images = scene.querySelectorAll<HTMLImageElement>(
          "[data-zsac-float] img",
        );
        const loops: gsap.core.Tween[] = [];
        images.forEach((image, index) => {
          loops.push(
            gsap.to(image, {
              y: index === 0 ? -6 : -4,
              duration: 2.8 + index * 0.22,
              delay: index * 0.19,
              repeat: -1,
              yoyo: true,
              ease: "sine.inOut",
              paused: true,
            }),
          );
        });
        loops.push(
          gsap.to(scene.querySelectorAll("[data-zsac-traces] path"), {
            strokeDashoffset: -22,
            duration: 2.1,
            repeat: -1,
            ease: "none",
            paused: true,
          }),
        );
        let inView = false;
        let entered = false;
        let entrance: gsap.core.Tween | undefined;
        const updatePlayback = () =>
          loops.forEach((loop) => {
            if (inView && !document.hidden) loop.play();
            else loop.pause();
          });
        const observer = new IntersectionObserver(
          ([entry]) => {
            inView = entry.isIntersecting;
            if (inView && !entered) {
              entered = true;
              entrance = gsap.from(layers, {
                y: 20,
                opacity: 0,
                duration: 1.05,
                stagger: 0.09,
                ease: "power3.out",
                clearProps: "opacity,y",
              });
            }
            updatePlayback();
          },
          { threshold: 0.08 },
        );
        observer.observe(scene);
        document.addEventListener("visibilitychange", updatePlayback);

        const pointer = gsap.matchMedia();
        pointer.add(
          "(hover: hover) and (pointer: fine) and (min-width: 1024px)",
          () => {
            let bounds = scene.getBoundingClientRect();
            const setters = layers.map((layer, index) => ({
              move: gsap.quickTo(layer, "x", {
                duration: 0.8,
                ease: "power3.out",
              }),
              depth: index === 0 ? 0.012 : 0.022,
            }));
            const enter = () => {
              bounds = scene.getBoundingClientRect();
            };
            const move = (event: PointerEvent) => {
              const distance = event.clientX - bounds.left - bounds.width / 2;
              setters.forEach((setter) => setter.move(distance * setter.depth));
            };
            const leave = () => setters.forEach((setter) => setter.move(0));
            scene.addEventListener("pointerenter", enter);
            scene.addEventListener("pointermove", move);
            scene.addEventListener("pointerleave", leave);
            return () => {
              scene.removeEventListener("pointerenter", enter);
              scene.removeEventListener("pointermove", move);
              scene.removeEventListener("pointerleave", leave);
            };
          },
        );
        cleanups.push(() => {
          observer.disconnect();
          document.removeEventListener("visibilitychange", updatePlayback);
          pointer.revert();
          entrance?.kill();
          loops.forEach((loop) => loop.kill());
        });
      });
    return () => cleanups.forEach((cleanup) => cleanup());
  });
  return () => media.revert();
}
