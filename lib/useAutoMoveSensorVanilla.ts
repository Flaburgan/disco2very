import * as tweenFunctions from "tween-functions";
import { GameState } from "../types/game";
import { DragSensor, SensorAPI, DragPosition } from "./dnd/types";

function moveStepByStep(
  moveCallback: (position: DragPosition) => void,
  dropCallback: () => void,
  transformValues: number[],
  scrollValues: number[],
  startX: number
) {
  requestAnimationFrame(() => {
    const playedItemsContainer = document.getElementById("top");

    if (playedItemsContainer === null) {
      dropCallback();
      return;
    }

    const newTransform = transformValues.shift();
    const newScroll = scrollValues.shift();

    if (newTransform === undefined || newScroll === undefined) {
      dropCallback();
    } else {
      playedItemsContainer.scrollLeft = newScroll;
      moveCallback({ x: startX + newTransform, y: 0 });
      moveStepByStep(
        moveCallback,
        dropCallback,
        transformValues,
        scrollValues,
        startX
      );
    }
  });
}

export default function useAutoMoveSensorVanilla(state: GameState): DragSensor {
  return async (api: SensorAPI) => {
    // Add a small delay to ensure the DOM is ready
    await new Promise((resolve) => setTimeout(resolve, 100));

    if (
      state.badlyPlaced === null ||
      state.badlyPlaced.index === null ||
      state.badlyPlaced.rendered === false
    ) {
      return;
    }

    const badlyPlacedItem = state.played[state.badlyPlaced.index];
    if (!badlyPlacedItem) {
      return;
    }

    const preDrag = api.tryGetLock?.(badlyPlacedItem.id);

    if (!preDrag) {
      return;
    }

    const itemEl: HTMLElement | null = document.querySelector(
      `[data-draggable-id='${badlyPlacedItem.id}']`
    );

    const targetIndex = state.badlyPlaced.index + state.badlyPlaced.delta;
    const targetItem = state.played[targetIndex];

    if (!targetItem) {
      return;
    }

    const destEl: HTMLElement | null = document.querySelector(
      `[data-draggable-id='${targetItem.id}']`
    );
    const playedItemsContainer: HTMLElement | null =
      document.getElementById("top");

    if (itemEl === null || destEl === null || playedItemsContainer === null) {
      return;
    }

    const itemRect = itemEl.getBoundingClientRect();
    const destRect = destEl.getBoundingClientRect();
    const containerRect = playedItemsContainer.getBoundingClientRect();

    const leftMarker =
      playedItemsContainer.scrollLeft + playedItemsContainer.clientWidth / 4;
    const rightMarker =
      playedItemsContainer.scrollLeft +
      (playedItemsContainer.clientWidth / 4) * 3 -
      itemEl.clientWidth;

    let scrollDistance = 0;

    if (destEl.offsetLeft < leftMarker || destEl.offsetLeft > rightMarker) {
      // Destination is not in middle two quarters of the screen. Calculate
      // distance we therefore need to scroll.
      scrollDistance =
        destEl.offsetLeft < leftMarker
          ? destEl.offsetLeft - leftMarker
          : destEl.offsetLeft - rightMarker;

      if (playedItemsContainer.scrollLeft + scrollDistance < 0) {
        scrollDistance = -playedItemsContainer.scrollLeft;
      } else if (
        playedItemsContainer.scrollLeft + scrollDistance >
        playedItemsContainer.scrollWidth - playedItemsContainer.clientWidth
      ) {
        scrollDistance =
          playedItemsContainer.scrollWidth -
          playedItemsContainer.clientWidth -
          playedItemsContainer.scrollLeft;
      }
    }

    // Calculate the distance we need to move the item after taking into account
    // how far we are scrolling.
    const transformDistance =
      destEl.offsetLeft - itemEl.offsetLeft - scrollDistance;

    const startPosition = {
      x: itemRect.left + itemRect.width / 2,
      y: itemRect.top + itemRect.height / 2,
    };

    const drag = preDrag.fluidLift(startPosition);

    // Create a series of eased transformations and scrolls to animate from the
    // current state to the desired state.
    const transformPoints = [];
    const scrollPoints = [];
    const numberOfPoints = Math.min(
      60,
      30 + 5 * Math.abs(state.badlyPlaced.delta)
    );

    for (let i = 1; i <= numberOfPoints; i++) {
      transformPoints.push(
        tweenFunctions.easeOutCirc(i, 0, transformDistance, numberOfPoints)
      );
      scrollPoints.push(
        tweenFunctions.easeOutCirc(
          i,
          playedItemsContainer.scrollLeft,
          playedItemsContainer.scrollLeft + scrollDistance,
          numberOfPoints
        )
      );
    }

    moveStepByStep(
      drag.move,
      drag.drop,
      transformPoints,
      scrollPoints,
      startPosition.x
    );
  };
}
