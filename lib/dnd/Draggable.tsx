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
    if (elementRef.current) {
      // Find the droppable parent
      const droppableParent = elementRef.current.closest("[data-droppable-id]");
      const droppableId =
        droppableParent?.getAttribute("data-droppable-id") || "";

      registerDraggable(draggableId, elementRef.current, index, droppableId);
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
    const startPosition = getMousePosition(event);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPosition = {
        x: moveEvent.clientX,
        y: moveEvent.clientY,
      };

      if (!isDragging) {
        // Start dragging if we've moved enough
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - startPosition.x, 2) +
            Math.pow(currentPosition.y - startPosition.y, 2)
        );

        if (distance > 5) {
          startDrag(draggableId, startPosition);
        }
      } else {
        updateDragPosition(currentPosition);
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      if (isDragging && draggedItem?.id === draggableId) {
        endDrag({
          x: upEvent.clientX,
          y: upEvent.clientY,
        });
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    if (isDragDisabled) return;

    event.preventDefault();
    const startPosition = getTouchPosition(event);

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentPosition = {
        x: moveEvent.touches[0].clientX,
        y: moveEvent.touches[0].clientY,
      };

      if (!isDragging) {
        // Start dragging if we've moved enough
        const distance = Math.sqrt(
          Math.pow(currentPosition.x - startPosition.x, 2) +
            Math.pow(currentPosition.y - startPosition.y, 2)
        );

        if (distance > 5) {
          startDrag(draggableId, startPosition);
        }
      } else {
        updateDragPosition(currentPosition);
      }
    };

    const handleTouchEnd = (endEvent: TouchEvent) => {
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);

      if (isDragging && draggedItem?.id === draggableId) {
        const lastTouch = endEvent.changedTouches[0];
        endDrag({
          x: lastTouch.clientX,
          y: lastTouch.clientY,
        });
      }
    };

    document.addEventListener("touchmove", handleTouchMove);
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
