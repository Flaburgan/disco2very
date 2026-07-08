// After an item is dropped at the wrong position, slide it along the timeline
// to its correct position, scrolling the container when the destination is
// off-screen.

// CSS approximation of the easeOutCirc tween previously used.
const EASE_OUT_CIRC_CSS = "cubic-bezier(0.075, 0.82, 0.165, 1)";

function easeOutCirc(
  elapsed: number,
  from: number,
  to: number,
  duration: number,
): number {
  const progress = elapsed / duration - 1;
  return (to - from) * Math.sqrt(1 - progress * progress) + from;
}

export interface AutoMoveAnimation {
  // Resolves to false when the animation was cancelled before completing.
  finished: Promise<boolean>;
  cancel: () => void;
}

export function animateBadlyPlacedItem(
  scrollContainer: HTMLElement,
  list: HTMLElement,
  index: number,
  delta: number,
): AutoMoveAnimation {
  const cards = list.querySelectorAll<HTMLElement>("[data-timeline-card]");
  const itemEl = cards[index];
  const destEl = cards[index + delta];

  if (itemEl === undefined || destEl === undefined) {
    return { finished: Promise.resolve(true), cancel: () => undefined };
  }

  const leftMarker =
    scrollContainer.scrollLeft + scrollContainer.clientWidth / 4;
  const rightMarker =
    scrollContainer.scrollLeft +
    (scrollContainer.clientWidth / 4) * 3 -
    itemEl.clientWidth;

  let scrollDistance = 0;

  if (destEl.offsetLeft < leftMarker || destEl.offsetLeft > rightMarker) {
    // Destination is not in middle two quarters of the screen. Calculate
    // distance we therefore need to scroll.
    scrollDistance =
      destEl.offsetLeft < leftMarker
        ? destEl.offsetLeft - leftMarker
        : destEl.offsetLeft - rightMarker;
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollDistance = Math.max(
      -scrollContainer.scrollLeft,
      Math.min(maxScroll - scrollContainer.scrollLeft, scrollDistance),
    );
  }

  const duration = 750 + 125 * Math.abs(delta);
  const slide = destEl.offsetLeft - itemEl.offsetLeft;
  // The items between the two positions each shift by one slot in the other
  // direction to make room.
  const shift = -slide / Math.abs(delta);

  // Keep the moving card above the cards it slides over. Later siblings paint
  // on top of earlier ones, so without this the card would pass under them
  // when moving to the right.
  itemEl.style.zIndex = "10";

  const animations: Animation[] = [];
  const animate = (el: HTMLElement, distance: number) => {
    animations.push(
      el.animate(
        [
          { transform: "translateX(0)" },
          { transform: `translateX(${distance}px)` },
        ],
        { duration, easing: EASE_OUT_CIRC_CSS, fill: "forwards" },
      ),
    );
  };
  animate(itemEl, slide);
  const first = Math.min(index, index + delta);
  const last = Math.max(index, index + delta);
  for (let i = first; i <= last; i++) {
    if (i !== index) {
      animate(cards[i], shift);
    }
  }

  let cancelled = false;
  let raf = 0;
  const scrollFrom = scrollContainer.scrollLeft;
  const finished = new Promise<boolean>((resolve) => {
    let startTime: number | null = null;
    const tick = (now: number) => {
      if (cancelled) {
        resolve(false);
        return;
      }
      if (startTime === null) {
        startTime = now;
      }
      const elapsed = Math.min(now - startTime, duration);
      scrollContainer.scrollLeft = easeOutCirc(
        elapsed,
        scrollFrom,
        scrollFrom + scrollDistance,
        duration,
      );
      if (elapsed < duration) {
        raf = requestAnimationFrame(tick);
      } else {
        resolve(true);
      }
    };
    raf = requestAnimationFrame(tick);
  });

  return {
    finished,
    cancel: () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      itemEl.style.zIndex = "";
      for (const animation of animations) {
        animation.cancel();
      }
    },
  };
}
