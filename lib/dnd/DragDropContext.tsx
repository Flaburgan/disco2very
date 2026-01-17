import React, {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  DragContext,
  DragPosition,
  DropResult,
  DragDropContextProps,
  SensorAPI,
  PreDragActions,
  FluidDragActions,
} from "./types";

const DragDropContextState = createContext<DragContext | null>(null);

export const useDragDropContext = () => {
  const context = useContext(DragDropContextState);
  if (!context) {
    throw new Error("useDragDropContext must be used within DragDropContext");
  }
  return context;
};

export default function DragDropContext({
  children,
  onDragStart,
  onDragEnd,
  sensors = [],
}: DragDropContextProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] =
    useState<DragContext["draggedItem"]>(null);

  const droppablesRef = useRef<Map<string, HTMLElement>>(new Map());
  const draggablesRef = useRef<
    Map<string, { element: HTMLElement; index: number; droppableId: string }>
  >(new Map());
  const dragElementRef = useRef<HTMLElement | null>(null);
  const ghostElementRef = useRef<HTMLElement | null>(null);
  const initialPositionRef = useRef<DragPosition | null>(null);

  const registerDroppable = useCallback((id: string, element: HTMLElement) => {
    droppablesRef.current.set(id, element);
  }, []);

  const unregisterDroppable = useCallback((id: string) => {
    droppablesRef.current.delete(id);
  }, []);

  const registerDraggable = useCallback(
    (id: string, element: HTMLElement, index: number, droppableId: string) => {
      draggablesRef.current.set(id, { element, index, droppableId });
    },
    []
  );

  const unregisterDraggable = useCallback((id: string) => {
    draggablesRef.current.delete(id);
  }, []);

  const createGhostElement = useCallback(
    (originalElement: HTMLElement, position: DragPosition) => {
      const ghost = originalElement.cloneNode(true) as HTMLElement;
      const rect = originalElement.getBoundingClientRect();

      ghost.style.position = "fixed";
      ghost.style.pointerEvents = "none";
      ghost.style.zIndex = "9999";
      ghost.style.transform = "rotate(5deg)";
      ghost.style.opacity = "0.8";
      ghost.style.transition = "none";
      ghost.style.width = `${rect.width}px`;
      ghost.style.height = `${rect.height}px`;
      ghost.style.left = `${position.x - rect.width / 2}px`;
      ghost.style.top = `${position.y - rect.height / 2}px`;

      document.body.appendChild(ghost);
      return ghost;
    },
    []
  );

  const updateGhostPosition = useCallback((position: DragPosition) => {
    if (ghostElementRef.current) {
      const rect = ghostElementRef.current.getBoundingClientRect();
      ghostElementRef.current.style.left = `${position.x - rect.width / 2}px`;
      ghostElementRef.current.style.top = `${position.y - rect.height / 2}px`;
    }
  }, []);

  const findDropTarget = useCallback(
    (position: DragPosition): { droppableId: string; index: number } | null => {
      for (const [
        droppableId,
        droppableElement,
      ] of droppablesRef.current.entries()) {
        const rect = droppableElement.getBoundingClientRect();
        if (
          position.x >= rect.left &&
          position.x <= rect.right &&
          position.y >= rect.top &&
          position.y <= rect.bottom
        ) {
          // Find the insertion index
          const draggables = Array.from(draggablesRef.current.entries())
            .filter(([draggableId, data]) => {
              // Exclude the currently dragged item from insertion calculation
              return (
                data.droppableId === droppableId &&
                (!draggedItem || draggableId !== draggedItem.id)
              );
            })
            .sort(([, a], [, b]) => a.index - b.index);

          let insertIndex = 0;
          const isVertical =
            droppableElement.style.flexDirection === "column" ||
            droppableElement.dataset.direction === "vertical";

          for (let i = 0; i < draggables.length; i++) {
            const [, data] = draggables[i];
            const elementRect = data.element.getBoundingClientRect();

            if (isVertical) {
              if (position.y < elementRect.top + elementRect.height / 2) {
                insertIndex = i;
                break;
              }
            } else {
              if (position.x < elementRect.left + elementRect.width / 2) {
                insertIndex = i;
                break;
              }
            }
            insertIndex = i + 1;
          }

          return { droppableId, index: insertIndex };
        }
      }
      return null;
    },
    [draggedItem]
  );

  const startDrag = useCallback(
    (draggableId: string, position: DragPosition) => {
      console.log("Starting drag:", draggableId, position);
      const draggableData = draggablesRef.current.get(draggableId);
      if (!draggableData) {
        console.warn("No draggable data found for:", draggableId);
        return;
      }

      console.log("Draggable data:", draggableData);
      setIsDragging(true);
      setDraggedItem({
        id: draggableId,
        source: {
          droppableId: draggableData.droppableId,
          index: draggableData.index,
        },
      });

      dragElementRef.current = draggableData.element;
      initialPositionRef.current = position;

      // Create ghost element
      ghostElementRef.current = createGhostElement(
        draggableData.element,
        position
      );

      // Hide original element
      draggableData.element.style.opacity = "0.5";

      onDragStart?.();
    },
    [createGhostElement, updateGhostPosition, onDragStart]
  );

  const updateDragPosition = useCallback(
    (position: DragPosition) => {
      // console.log('Updating drag position:', position);
      updateGhostPosition(position);
    },
    [updateGhostPosition]
  );

  const endDrag = useCallback(
    (position: DragPosition) => {
      if (!draggedItem) {
        console.warn("EndDrag called but no dragged item");
        return;
      }

      console.log("Ending drag:", draggedItem.id, "at position:", position);
      const destination = findDropTarget(position);
      console.log("Drop destination:", destination);

      // Clean up ghost element
      if (ghostElementRef.current) {
        try {
          document.body.removeChild(ghostElementRef.current);
        } catch (error) {
          console.warn("Ghost element already removed");
        }
        ghostElementRef.current = null;
      }

      // Restore original element
      if (dragElementRef.current) {
        dragElementRef.current.style.opacity = "";
        dragElementRef.current = null;
      }

      const result: DropResult = {
        source: draggedItem.source,
        destination,
      };

      console.log("Drop result:", result);
      setIsDragging(false);
      setDraggedItem(null);
      initialPositionRef.current = null;

      onDragEnd(result);
    },
    [draggedItem, findDropTarget, onDragEnd]
  );

  // Sensor API implementation
  const sensorAPI: SensorAPI = {
    tryGetLock: (draggableId: string): PreDragActions | null => {
      const draggableData = draggablesRef.current.get(draggableId);
      if (!draggableData) return null;

      return {
        fluidLift: (position: DragPosition): FluidDragActions => {
          startDrag(draggableId, position);

          return {
            move: (newPosition: DragPosition) => {
              updateDragPosition(newPosition);
            },
            drop: () => {
              if (initialPositionRef.current) {
                endDrag(initialPositionRef.current);
              }
            },
          };
        },
      };
    },
  };

  // Run sensors
  React.useEffect(() => {
    if (sensors.length > 0) {
      sensors.forEach((sensor) => {
        try {
          sensor(sensorAPI);
        } catch (error) {
          console.warn("Sensor error:", error);
        }
      });
    }
  }, [sensors]);

  const contextValue: DragContext = {
    isDragging,
    draggedItem,
    registerDroppable,
    unregisterDroppable,
    registerDraggable,
    unregisterDraggable,
    startDrag,
    updateDragPosition,
    endDrag,
  };

  return (
    <DragDropContextState.Provider value={contextValue}>
      {children}
    </DragDropContextState.Provider>
  );
}
