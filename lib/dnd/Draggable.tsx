import React, { useRef, useEffect } from "react";
import { useDragDropContext } from "./DragDropContext";
import { DragSnapshot, DraggableProvided, DragPosition } from "./types";

interface DraggableProps {
  draggableId: string;
  index: number;
  isDragDisabled?: boolean;
  children: (
    provided: DraggableProvided,
    snapshot: DragSnapshot
  ) => React.ReactNode;
}

export default function Draggable({
  draggableId,
  index,
  isDragDisabled = false,
  children,
}: DraggableProps) {
  const {
    registerDraggable,
    unregisterDraggable,
    startDrag,
    updateDragPosition,
    endDrag,
    isDragging,
    draggedItem,
  } = useDragDropContext();

  const elementRef = useRef<HTMLElement>(null);
  const isDraggingThis = isDragging && draggedItem?.id === draggableId;

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      // Find the droppable parent
      const droppableParent = element.closest("[data-droppable-id]");
      const droppableId =
        droppableParent?.getAttribute("data-droppable-id") || "";

      registerDraggable(draggableId, element, index, droppableId);
    }

    return () => {
      unregisterDraggable(draggableId);
    };
  }, [draggableId, index, registerDraggable, unregisterDraggable]);

  const getMousePosition = (event: React.MouseEvent): DragPosition => ({
    x: event.clientX,
    y: event.clientY,
  });

  const getTouchPosition = (event: React.TouchEvent): DragPosition => ({
    x: event.touches[0].clientX,
    y: event.touches[0].clientY,
  });

  const handleMouseDown = (event: React.MouseEvent) => {
    if (isDragDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    const startPosition = getMousePosition(event);
    let hasDragStarted = false;
    let dragStartTimeout: NodeJS.Timeout;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      moveEvent.preventDefault();

      const currentPosition = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      if (!hasDragStarted) {
        // Start dragging if we've moved enough
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - startPosition.x, 2) +
            Math.pow(currentPosition.y - startPosition.y, 2)
        );

        if (distance > 3) {
          console.log(
            "Mouse drag threshold reached, starting drag:",
            draggableId
          );
          clearTimeout(dragStartTimeout);
          startDrag(draggableId, currentPosition);
          hasDragStarted = true;
        }
      } else if (isDragging && draggedItem?.id === draggableId) {
        updateDragPosition(currentPosition);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      clearTimeout(dragStartTimeout);
      document.removeEventListener("mousemove", handleMouseMove, true);
      document.removeEventListener("mouseup", handleMouseUp, true);

      if (hasDragStarted && isDragging && draggedItem?.id === draggableId) {
        endDrag({
          x: upEvent.clientX,
          y: upEvent.clientY,
        });
      }
    };

    // Start drag immediately on long press (for touch-like behavior on desktop)
    dragStartTimeout = setTimeout(() => {
      if (!hasDragStarted) {
        console.log("Mouse long press timeout, starting drag:", draggableId);
        startDrag(draggableId, startPosition);
        hasDragStarted = true;
      }
    }, 150);

    document.addEventListener("mousemove", handleMouseMove, true);
    document.addEventListener("mouseup", handleMouseUp, true);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isDragDisabled) return;

    event.preventDefault();
    event.stopPropagation();

    const startPosition = getTouchPosition(event);
    let hasDragStarted = false;
    let longPressTimeout: NodeJS.Timeout;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      moveEvent.preventDefault();

      if (moveEvent.touches.length === 0) return;

      const currentPosition = {
        x: moveEvent.touches[0].clientX,
        y: moveEvent.touches[0].clientY,
      };

      if (!hasDragStarted) {
        // Start dragging if we've moved enough or after long press
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - startPosition.x, 2) +
            Math.pow(currentPosition.y - startPosition.y, 2)
        );

        if (distance > 3) {
          console.log(
            "Touch drag threshold reached, starting drag:",
            draggableId
          );
          clearTimeout(longPressTimeout);
          startDrag(draggableId, currentPosition);
          hasDragStarted = true;
        }
      } else if (isDragging && draggedItem?.id === draggableId) {
        updateDragPosition(currentPosition);
      }
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      clearTimeout(longPressTimeout);
      document.removeEventListener(
        "touchmove",
        handleTouchMove as EventListener
      );
      document.removeEventListener("touchend", handleTouchEnd);

      if (hasDragStarted && isDragging && draggedItem?.id === draggableId) {
        const lastTouch = endEvent.changedTouches[0] || endEvent.touches[0];
        if (lastTouch) {
          endDrag({
            x: lastTouch.clientX,
            y: lastTouch.clientY,
          });
        }
      }
    };

    // Long press to start drag
    longPressTimeout = setTimeout(() => {
      if (!hasDragStarted) {
        console.log("Touch long press timeout, starting drag:", draggableId);
        startDrag(draggableId, startPosition);
        hasDragStarted = true;
      }
    }, 300);

    document.addEventListener("touchmove", handleTouchMove as EventListener, {
      passive: false,
    });
    document.addEventListener("touchend", handleTouchEnd);
  };

  const provided: DraggableProvided = {
    innerRef: elementRef,
    draggableProps: {
      "data-draggable-id": draggableId,
    },
    dragHandleProps: {
      onMouseDown: handleMouseDown,
      onTouchStart: handleTouchStart,
    },
  };

  const snapshot: DragSnapshot = {
    isDragging: isDraggingThis,
  };

  return <>{children(provided, snapshot)}</>;
}
