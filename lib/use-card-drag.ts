import React from "react";
import { flushSync } from "react-dom";

// Distance in px the pointer must travel before a press becomes a drag.
const DRAG_THRESHOLD = 5;
// Width in px of the zones at the timeline edges that trigger auto-scrolling.
const AUTOSCROLL_ZONE = 80;
// Maximum auto-scroll speed in px per frame.
const AUTOSCROLL_MAX_SPEED = 12;
const DROP_DURATION = 300;
const DROP_EASING = "cubic-bezier(0.2, 1, 0.1, 1)";

interface DragSession {
  el: HTMLElement;
  pointerId: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  // Bounding rect of the card when it was lifted; null until the drag
  // threshold is passed.
  rect: DOMRect | null;
  dropIndex: number | null;
  raf: number;
  finished: boolean;
  detach: () => void;
}

interface Args {
  disabled: boolean;
  // The horizontally scrollable element containing the timeline.
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  // The flex container holding the played cards.
  playedListRef: React.RefObject<HTMLElement | null>;
  onDrop: (index: number) => void;
}

function resetCardStyle(el: HTMLElement) {
  const style = el.style;
  style.position = "";
  style.top = "";
  style.left = "";
  style.width = "";
  style.height = "";
  style.margin = "";
  style.zIndex = "";
  style.transform = "";
  document.body.style.cursor = "";
}

/**
 * Drag and drop of the next card onto the timeline, implemented with Pointer
 * Events so that it works with mouse, touch and pen on all browsers.
 *
 * While a card is dragged over the timeline, `dropIndex` is the index at
 * which it would be inserted (the timeline opens a gap there). On release the
 * card animates into the gap and `onDrop` is called, or animates back to its
 * origin when released elsewhere.
 */
export default function useCardDrag(args: Args) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dropIndex, setDropIndex] = React.useState<number | null>(null);
  const sessionRef = React.useRef<DragSession | null>(null);
  const argsRef = React.useRef(args);
  // Keep the latest args available to the event handlers without re-attaching
  // them; pointer events always fire after the commit, so the ref is current.
  React.useEffect(() => {
    argsRef.current = args;
  });

  // Abort an ongoing drag if the component unmounts.
  React.useEffect(() => {
    return () => {
      const session = sessionRef.current;
      if (session !== null) {
        session.finished = true;
        cancelAnimationFrame(session.raf);
        session.detach();
        resetCardStyle(session.el);
        sessionRef.current = null;
      }
    };
  }, []);

  function timelineCards(list: HTMLElement): NodeListOf<HTMLElement> {
    return list.querySelectorAll("[data-timeline-card]");
  }

  function cardCenterX(session: DragSession): number {
    const rect = session.rect as DOMRect;
    return rect.left + rect.width / 2 + (session.lastX - session.startX);
  }

  // The insertion index the dragged card is hovering over, based on the
  // center of the card (like react-beautiful-dnd), or null when the card is
  // not over the timeline.
  function computeDropIndex(session: DragSession): number | null {
    const list = argsRef.current.playedListRef.current;
    const rect = session.rect;
    if (list === null || rect === null) {
      return null;
    }
    const centerX = cardCenterX(session);
    const centerY =
      rect.top + rect.height / 2 + (session.lastY - session.startY);
    const zone = (list.parentElement ?? list).getBoundingClientRect();
    if (
      centerX < zone.left ||
      centerX > zone.right ||
      centerY < zone.top ||
      centerY > zone.bottom
    ) {
      return null;
    }
    let index = 0;
    for (const card of timelineCards(list)) {
      const cardRect = card.getBoundingClientRect();
      if (centerX > cardRect.left + cardRect.width / 2) {
        index++;
      }
    }
    return index;
  }

  function updateDropIndex(session: DragSession) {
    const index = computeDropIndex(session);
    if (index !== session.dropIndex) {
      session.dropIndex = index;
      setDropIndex(index);
    }
  }

  // Viewport position of the gap opened at `index`, as a translation relative
  // to the card's lifted position.
  function slotPosition(
    session: DragSession,
    index: number,
  ): { x: number; y: number } | null {
    const list = argsRef.current.playedListRef.current;
    const rect = session.rect;
    if (list === null || rect === null) {
      return null;
    }
    const cards = timelineCards(list);
    // The gap is the margin-left of the card at `index`, or of the trailing
    // "+" area when inserting at the end.
    const gapEl = index < cards.length ? cards[index] : list.lastElementChild;
    if (gapEl === null) {
      return null;
    }
    const gapRect = gapEl.getBoundingClientRect();
    const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
    return {
      x: gapRect.left - gap - rect.width - rect.left,
      y: gapRect.top + (gapRect.height - rect.height) / 2 - rect.top,
    };
  }

  function autoScrollSpeed(overlap: number): number {
    return Math.ceil(
      AUTOSCROLL_MAX_SPEED * Math.min(1, overlap / AUTOSCROLL_ZONE),
    );
  }

  // Scroll the timeline when the card is dragged close to its edges.
  function autoScroll(session: DragSession) {
    const scrollContainer = argsRef.current.scrollContainerRef.current;
    if (
      scrollContainer === null ||
      session.rect === null ||
      session.dropIndex === null
    ) {
      return;
    }
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    if (maxScroll <= 0) {
      return;
    }
    const centerX = cardCenterX(session);
    const rect = scrollContainer.getBoundingClientRect();
    let delta = 0;
    if (centerX < rect.left + AUTOSCROLL_ZONE) {
      delta = -autoScrollSpeed(rect.left + AUTOSCROLL_ZONE - centerX);
    } else if (centerX > rect.right - AUTOSCROLL_ZONE) {
      delta = autoScrollSpeed(centerX - (rect.right - AUTOSCROLL_ZONE));
    }
    if (delta !== 0) {
      const before = scrollContainer.scrollLeft;
      scrollContainer.scrollLeft = Math.max(
        0,
        Math.min(maxScroll, before + delta),
      );
      if (scrollContainer.scrollLeft !== before) {
        updateDropIndex(session);
      }
    }
  }

  // Take the card out of the flow so it can follow the pointer.
  function liftCard(session: DragSession) {
    const rect = session.el.getBoundingClientRect();
    session.rect = rect;
    const style = session.el.style;
    style.position = "fixed";
    style.top = `${rect.top}px`;
    style.left = `${rect.left}px`;
    style.width = `${rect.width}px`;
    style.height = `${rect.height}px`;
    style.margin = "0";
    style.zIndex = "5000";
    document.body.style.cursor = "grabbing";
    setIsDragging(true);

    const tick = () => {
      autoScroll(session);
      if (!session.finished) {
        session.raf = requestAnimationFrame(tick);
      }
    };
    session.raf = requestAnimationFrame(tick);
  }

  function moveCard(session: DragSession) {
    session.el.style.transform = `translate(${
      session.lastX - session.startX
    }px, ${session.lastY - session.startY}px)`;
    updateDropIndex(session);
  }

  // Animate the card into the gap (index !== null) or back to its origin,
  // then commit.
  function settle(session: DragSession, index: number | null) {
    session.finished = true;
    cancelAnimationFrame(session.raf);
    session.detach();

    const from = `translate(${session.lastX - session.startX}px, ${
      session.lastY - session.startY
    }px)`;
    const target = index === null ? null : slotPosition(session, index);
    const to =
      target === null
        ? "translate(0px, 0px)"
        : `translate(${target.x}px, ${target.y}px)`;

    const animation = session.el.animate(
      [{ transform: from }, { transform: to }],
      { duration: DROP_DURATION, easing: DROP_EASING, fill: "forwards" },
    );
    animation.onfinish = () => {
      // Commit the new state and only then remove the drag styles, in the
      // same task, so the browser never paints an intermediate frame.
      flushSync(() => {
        setIsDragging(false);
        setDropIndex(null);
        if (target !== null && index !== null) {
          argsRef.current.onDrop(index);
        }
      });
      animation.cancel();
      resetCardStyle(session.el);
      sessionRef.current = null;
    };
  }

  function endPointer(session: DragSession, index: number | null) {
    if (session.rect === null) {
      // The press never became a drag: just clean up.
      session.finished = true;
      session.detach();
      sessionRef.current = null;
      return;
    }
    settle(session, index);
  }

  function handleCardPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (argsRef.current.disabled || sessionRef.current !== null) {
      return;
    }
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }
    const el = event.currentTarget;
    // Prevents text selection and native image dragging from hijacking the
    // gesture.
    event.preventDefault();
    el.setPointerCapture(event.pointerId);

    const session: DragSession = {
      el,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      rect: null,
      dropIndex: null,
      raf: 0,
      finished: false,
      detach: () => undefined,
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerId !== session.pointerId || session.finished) {
        return;
      }
      session.lastX = e.clientX;
      session.lastY = e.clientY;
      if (session.rect === null) {
        const distance = Math.hypot(
          e.clientX - session.startX,
          e.clientY - session.startY,
        );
        if (distance < DRAG_THRESHOLD) {
          return;
        }
        liftCard(session);
      }
      moveCard(session);
    };
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerId !== session.pointerId || session.finished) {
        return;
      }
      endPointer(session, session.dropIndex);
    };
    const onPointerCancel = (e: PointerEvent) => {
      if (e.pointerId !== session.pointerId || session.finished) {
        return;
      }
      endPointer(session, null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !session.finished) {
        endPointer(session, null);
      }
    };

    // Thanks to setPointerCapture all pointer events are retargeted to the
    // card element until the pointer is released.
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);
    window.addEventListener("keydown", onKeyDown);
    session.detach = () => {
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
      window.removeEventListener("keydown", onKeyDown);
    };
    sessionRef.current = session;
  }

  return { isDragging, dropIndex, handleCardPointerDown };
}
