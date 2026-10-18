type Point = { x: number; y: number };

function roundedPath(points: Point[]) {
  let path = `M${points[0].x},${points[0].y}`;
  for (let index = 1; index < points.length - 1; index++) {
    const previous = points[index - 1];
    const corner = points[index];
    const next = points[index + 1];
    const incoming = Math.hypot(corner.x - previous.x, corner.y - previous.y);
    const outgoing = Math.hypot(next.x - corner.x, next.y - corner.y);
    if (incoming < 0.1 || outgoing < 0.1) continue;
    const radius = Math.min(10, incoming / 2, outgoing / 2);
    const before = {
      x: corner.x - ((corner.x - previous.x) * radius) / incoming,
      y: corner.y - ((corner.y - previous.y) * radius) / incoming,
    };
    const after = {
      x: corner.x + ((next.x - corner.x) * radius) / outgoing,
      y: corner.y + ((next.y - corner.y) * radius) / outgoing,
    };
    path += `L${before.x},${before.y}Q${corner.x},${corner.y} ${after.x},${after.y}`;
  }
  const last = points[points.length - 1];
  return `${path}L${last.x},${last.y}`;
}

export function initZsacTopology() {
  const cleanups: (() => void)[] = [];
  document
    .querySelectorAll<HTMLElement>("[data-zsac-architecture]")
    .forEach((root) => {
      const board = root.querySelector<HTMLElement>(".zsac-topology");
      const svg = root.querySelector<SVGSVGElement>("[data-topology-lines]");
      const gateway = root.querySelector<HTMLElement>(".zsac-core-frame");
      const gatewayColumn = root.querySelector<HTMLElement>(
        ".zsac-gateway-column",
      );
      const controls = root.querySelector<HTMLElement>(".zsac-control-pair");
      const options = root.querySelector<HTMLElement>(".zsac-terminal-options");
      const choices = Array.from(
        root.querySelectorAll<HTMLElement>("[data-terminal]"),
      );
      const services = Array.from(
        root.querySelectorAll<HTMLElement>(".zsac-services li"),
      );
      if (!board || !svg || !gateway || !gatewayColumn || !controls || !options)
        return;
      let frame = 0;
      let disposed = false;
      const draw = () => {
        const origin = board.getBoundingClientRect();
        if (!origin.width || !origin.height) return;
        const rect = (element: Element) => {
          const box = element.getBoundingClientRect();
          return {
            left: box.left - origin.left,
            right: box.right - origin.left,
            top: box.top - origin.top,
            bottom: box.bottom - origin.top,
            width: box.width,
            height: box.height,
          };
        };
        const core = rect(gateway);
        const control = rect(controls);
        const group = rect(options);
        const mobile = matchMedia("(max-width: 520px)").matches;
        const stackedServices = matchMedia("(max-width: 800px)").matches;
        const input = mobile
          ? { x: origin.width / 2, y: rect(gatewayColumn).top - 6 }
          : {
              x: core.left + core.width * 0.15,
              y: core.top + core.height * 0.62,
            };
        const output = stackedServices
          ? mobile
            ? { x: control.right + 3, y: control.top + control.height / 2 }
            : { x: control.left + control.width / 2, y: control.bottom + 3 }
          : { x: core.right - core.width * 0.15, y: input.y };
        svg.setAttribute("viewBox", `0 0 ${origin.width} ${origin.height}`);
        const positionPort = (selector: string, point: Point) => {
          const port = svg.querySelector(selector);
          port?.setAttribute("cx", String(point.x));
          port?.setAttribute("cy", String(point.y));
        };
        choices.forEach((choice, index) => {
          const box = rect(choice);
          const leftColumn = index % 2 === 0;
          const start = {
            x: mobile && leftColumn ? box.left - 3 : box.right + 3,
            y: box.top + box.height / 2,
          };
          let points: Point[];
          if (mobile) {
            const rail = leftColumn ? -9 : origin.width + 9;
            const busY = group.bottom + 13;
            points = [
              start,
              { x: rail, y: start.y },
              { x: rail, y: busY },
              { x: input.x, y: busY },
              input,
            ];
          } else {
            const busX =
              group.right + Math.max(12, (input.x - group.right) * 0.47);
            points = [
              start,
              { x: busX, y: start.y },
              { x: busX, y: input.y },
              input,
            ];
          }
          svg
            .querySelector(`[data-route="${choice.dataset.terminal}"]`)
            ?.setAttribute("d", roundedPath(points));
          positionPort(
            `[data-terminal-port="${choice.dataset.terminal}"]`,
            start,
          );
        });
        services.forEach((service, index) => {
          const box = rect(service);
          const end = stackedServices
            ? { x: box.left + Math.min(27, box.width / 2), y: box.top + 5 }
            : { x: box.left - 3, y: box.top + box.height / 2 };
          let points: Point[];
          if (stackedServices) {
            const busY = rect(services[0]).top - 11;
            const rail = mobile ? origin.width + 9 : output.x;
            points = [
              output,
              { x: rail, y: output.y },
              { x: rail, y: busY },
              { x: end.x, y: busY },
              end,
            ];
          } else {
            const busX = output.x + (end.x - output.x) * 0.53;
            points = [
              output,
              { x: busX, y: output.y },
              { x: busX, y: end.y },
              end,
            ];
          }
          svg
            .querySelector(`[data-service-route="${index}"]`)
            ?.setAttribute("d", roundedPath(points));
          positionPort(`[data-service-port="${index}"]`, end);
        });
        positionPort("[data-gateway-in]", input);
        positionPort("[data-gateway-out]", output);
        const activeRoute = svg.querySelector(".zsac-route.is-active");
        if (activeRoute) svg.append(activeRoute);
        svg.dataset.ready = "true";
      };
      const schedule = () => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(draw);
      };
      const observer = new ResizeObserver(schedule);
      observer.observe(board);
      [
        gateway,
        gatewayColumn,
        controls,
        options,
        ...choices,
        ...services,
      ].forEach((element) => observer.observe(element));
      window.addEventListener("resize", schedule);
      document.fonts.ready.then(() => {
        if (!disposed) schedule();
      });
      schedule();
      cleanups.push(() => {
        disposed = true;
        cancelAnimationFrame(frame);
        observer.disconnect();
        window.removeEventListener("resize", schedule);
      });
    });
  return () => cleanups.forEach((cleanup) => cleanup());
}
