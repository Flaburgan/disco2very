import React, { useRef, useEffect } from "react";
import { useDragDropContext } from "./DragDropContext";
import { DroppableSnapshot, DroppableProvided } from "./types";

interface DroppableProps {
  droppableId: string;
  direction?: "horizontal" | "vertical";
  children: (
    provided: DroppableProvided,
    snapshot: DroppableSnapshot
  ) => React.ReactNode;
}

export default function Droppable({
  droppableId,
  direction = "horizontal",
  children,
}: DroppableProps) {
  const { registerDroppable, unregisterDroppable, isDragging, draggedItem } =
    useDragDropContext();
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (elementRef.current) {
      registerDroppable(droppableId, elementRef.current);
      // Set direction data attribute for drop target calculation
      elementRef.current.dataset.direction = direction;
    }

    return () => {
      unregisterDroppable(droppableId);
    };
  }, [droppableId, direction, registerDroppable, unregisterDroppable]);

  const isDraggingOver = isDragging && draggedItem !== null;

  const provided: DroppableProvided = {
    innerRef: elementRef,
    droppableProps: {
      "data-droppable-id": droppableId,
    },
    placeholder: null, // We don't need placeholder for our implementation
  };

  const snapshot: DroppableSnapshot = {
    isDraggingOver,
  };

  return <>{children(provided, snapshot)}</>;
}
