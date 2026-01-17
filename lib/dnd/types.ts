export interface DragPosition {
  x: number;
  y: number;
}

export interface DropResult {
  source: {
    droppableId: string;
    index: number;
  };
  destination: {
    droppableId: string;
    index: number;
  } | null;
}

export interface DragSnapshot {
  isDragging: boolean;
}

export interface DroppableSnapshot {
  isDraggingOver: boolean;
}

export interface DroppableProvided {
  innerRef: React.RefObject<HTMLElement | null>;
  droppableProps: {
    "data-droppable-id": string;
  };
  placeholder: React.ReactNode;
}

export interface DraggableProvided {
  innerRef: React.RefObject<HTMLElement | null>;
  draggableProps: {
    "data-draggable-id": string;
  };
  dragHandleProps: {
    onMouseDown: (event: React.MouseEvent) => void;
    onTouchStart: (event: React.TouchEvent) => void;
  };
}

export interface DragDropContextProps {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd: (result: DropResult) => void;
  sensors?: DragSensor[];
}

export interface DragSensor {
  (api: SensorAPI): Promise<void>;
}

export interface SensorAPI {
  tryGetLock?: (draggableId: string) => PreDragActions | null;
}

export interface PreDragActions {
  fluidLift: (position: DragPosition) => FluidDragActions;
}

export interface FluidDragActions {
  move: (position: DragPosition) => void;
  drop: () => void;
}

export interface DragContext {
  isDragging: boolean;
  draggedItem: {
    id: string;
    source: {
      droppableId: string;
      index: number;
    };
  } | null;
  registerDroppable: (id: string, element: HTMLElement) => void;
  unregisterDroppable: (id: string) => void;
  registerDraggable: (
    id: string,
    element: HTMLElement,
    index: number,
    droppableId: string
  ) => void;
  unregisterDraggable: (id: string) => void;
  startDrag: (draggableId: string, position: DragPosition) => void;
  updateDragPosition: (position: DragPosition) => void;
  endDrag: (position: DragPosition) => void;
}
