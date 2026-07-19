"use client";

import { useEffect } from "react";

const ROOT_ACTIVE_CLASS = "conversation-viewport-active";
const VIEWPORT_DIRECTION_TOLERANCE = 1;

const VIEWPORT_PROPERTIES = [
  "--conversation-viewport-height",
  "--conversation-viewport-page-top",
  "--conversation-viewport-bottom",
] as const;

type ViewportProperty = (typeof VIEWPORT_PROPERTIES)[number];

type PreviousPropertyValue = {
  value: string;
  priority: string;
};

type ViewportDirection = "opening" | "closing" | null;

function toCssPixels(value: number): string {
  const roundedValue = Math.round(Math.max(0, value) * 100) / 100;
  return `${roundedValue}px`;
}

/**
 * Publishes the visible mobile viewport as document coordinates.
 *
 * Safari remains responsible for keyboard dismissal. The conversation stage
 * follows each viewport event directly instead of predicting or animating the
 * browser's closing sequence.
 */
export function useConversationViewport(active: boolean): void {
  useEffect(() => {
    if (!active) {
      return;
    }

    const root = document.documentElement;
    const previousValues = new Map<ViewportProperty, PreviousPropertyValue>(
      VIEWPORT_PROPERTIES.map((property) => [
        property,
        {
          value: root.style.getPropertyValue(property),
          priority: root.style.getPropertyPriority(property),
        },
      ]),
    );
    const activeClassWasPresent = root.classList.contains(ROOT_ACTIVE_CLASS);
    const initialScrollX = window.scrollX;
    const initialScrollY = window.scrollY;

    let animationFrameId: number | null = null;
    let previousViewportHeight =
      window.visualViewport?.height ?? window.innerHeight;
    let previousWindowPageTop = window.scrollY;
    let previousVisualPageTop =
      window.visualViewport?.pageTop ?? previousWindowPageTop;
    let viewportDirection: ViewportDirection = null;

    const publishViewport = () => {
      const visualViewport = window.visualViewport;
      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      const windowPageTop = window.scrollY;
      const visualPageTop = visualViewport?.pageTop ?? windowPageTop;
      const earlierPageTop = Math.min(windowPageTop, visualPageTop);
      const laterPageTop = Math.max(windowPageTop, visualPageTop);
      const sourceMovedForward =
        windowPageTop > previousWindowPageTop
        || visualPageTop > previousVisualPageTop;
      const sourceMovedBack =
        windowPageTop < previousWindowPageTop
        || visualPageTop < previousVisualPageTop;

      if (
        viewportHeight
        < previousViewportHeight - VIEWPORT_DIRECTION_TOLERANCE
      ) {
        viewportDirection = "opening";
      } else if (
        viewportHeight
        > previousViewportHeight + VIEWPORT_DIRECTION_TOLERANCE
      ) {
        viewportDirection = "closing";
      } else if (sourceMovedForward && !sourceMovedBack) {
        viewportDirection = "opening";
      } else if (sourceMovedBack && !sourceMovedForward) {
        viewportDirection = "closing";
      }

      // Safari can publish scrollY and VisualViewport.pageTop separately.
      // Follow the source moving forward while opening and the source moving
      // back while closing.
      const viewportPageTop = viewportDirection === "closing"
        ? earlierPageTop
        : laterPageTop;
      const viewportBottom = viewportPageTop + viewportHeight;

      previousViewportHeight = viewportHeight;
      previousWindowPageTop = windowPageTop;
      previousVisualPageTop = visualPageTop;

      const nextValues: Record<ViewportProperty, string> = {
        "--conversation-viewport-height": toCssPixels(viewportHeight),
        "--conversation-viewport-page-top": toCssPixels(viewportPageTop),
        "--conversation-viewport-bottom": toCssPixels(viewportBottom),
      };

      for (const property of VIEWPORT_PROPERTIES) {
        const nextValue = nextValues[property];

        if (root.style.getPropertyValue(property) !== nextValue) {
          root.style.setProperty(property, nextValue);
        }
      }
    };

    const runScheduledUpdate = () => {
      animationFrameId = null;
      publishViewport();
    };

    const scheduleFollowUp = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(runScheduledUpdate);
    };

    const handleViewportChange = () => {
      // Apply values available in this event immediately, then reconcile once
      // more in case Safari publishes its paired viewport value later.
      publishViewport();
      scheduleFollowUp();
    };

    root.classList.add(ROOT_ACTIVE_CLASS);
    publishViewport();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("orientationchange", handleViewportChange);
      window.visualViewport?.removeEventListener(
        "resize",
        handleViewportChange,
      );
      window.visualViewport?.removeEventListener(
        "scroll",
        handleViewportChange,
      );

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      if (
        window.scrollX !== initialScrollX ||
        window.scrollY !== initialScrollY
      ) {
        window.scrollTo(initialScrollX, initialScrollY);
      }

      for (const property of VIEWPORT_PROPERTIES) {
        const previousValue = previousValues.get(property);

        if (previousValue?.value) {
          root.style.setProperty(
            property,
            previousValue.value,
            previousValue.priority,
          );
        } else {
          root.style.removeProperty(property);
        }
      }

      if (!activeClassWasPresent) {
        root.classList.remove(ROOT_ACTIVE_CLASS);
      }
    };
  }, [active]);
}

export default useConversationViewport;
