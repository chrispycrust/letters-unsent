"use client";

import { useEffect } from "react";

const ROOT_ACTIVE_CLASS = "conversation-viewport-active";
const VIEWPORT_DIRECTION_TOLERANCE = 1;
const TOUCH_AXIS_LOCK_THRESHOLD = 6;
const SCROLL_BOUNDARY_TOLERANCE = 1;
const NATIVE_SCROLL_AREA_SELECTOR = "[data-conversation-scroll-region]";

export const MOBILE_CONVERSATION_QUERY =
  "(max-width: 650px), (pointer: coarse) and (max-height: 650px)";

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

type TouchGesture = {
  identifier: number;
  startX: number;
  startY: number;
  previousY: number;
  axis: "pending" | "horizontal" | "vertical";
  scrollArea: HTMLElement | null;
};

function toCssPixels(value: number): string {
  const roundedValue = Math.round(Math.max(0, value) * 100) / 100;
  return `${roundedValue}px`;
}

function isMobileConversationViewport(): boolean {
  if (typeof window.matchMedia === "function") {
    return window.matchMedia(MOBILE_CONVERSATION_QUERY).matches;
  }

  return window.innerWidth <= 650;
}

function canScrollInFingerDirection(
  scrollArea: HTMLElement,
  fingerMovementY: number,
): boolean {
  const maximumScrollTop = Math.max(
    0,
    scrollArea.scrollHeight - scrollArea.clientHeight,
  );

  if (maximumScrollTop <= SCROLL_BOUNDARY_TOLERANCE) {
    return false;
  }

  if (fingerMovementY < 0) {
    return scrollArea.scrollTop
      < maximumScrollTop - SCROLL_BOUNDARY_TOLERANCE;
  }

  if (fingerMovementY > 0) {
    return scrollArea.scrollTop > SCROLL_BOUNDARY_TOLERANCE;
  }

  return true;
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
    const mobileConversationMediaQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia(MOBILE_CONVERSATION_QUERY)
        : null;

    let animationFrameId: number | null = null;
    let previousViewportHeight =
      window.visualViewport?.height ?? window.innerHeight;
    let previousWindowPageTop = window.scrollY;
    let previousVisualPageTop =
      window.visualViewport?.pageTop ?? previousWindowPageTop;
    let viewportDirection: ViewportDirection = null;
    let touchGesture: TouchGesture | null = null;
    let touchGuardInstalled = false;

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

    const handleTouchStart = (event: TouchEvent) => {
      if (
        !isMobileConversationViewport()
        || event.touches.length !== 1
      ) {
        touchGesture = null;
        return;
      }

      const touch = event.touches[0];
      const target = event.target;
      const closestScrollArea =
        target instanceof Element
          ? target.closest(NATIVE_SCROLL_AREA_SELECTOR)
          : null;

      touchGesture = {
        identifier: touch.identifier,
        startX: touch.clientX,
        startY: touch.clientY,
        previousY: touch.clientY,
        axis: "pending",
        scrollArea:
          closestScrollArea instanceof HTMLElement
            ? closestScrollArea
            : null,
      };
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!touchGesture) {
        return;
      }

      if (event.touches.length !== 1) {
        touchGesture = null;
        return;
      }

      const touch = event.touches[0];

      if (touch.identifier !== touchGesture.identifier) {
        touchGesture = null;
        return;
      }

      const horizontalDistance = Math.abs(touch.clientX - touchGesture.startX);
      const verticalDistance = Math.abs(touch.clientY - touchGesture.startY);
      const fingerMovementY = touch.clientY - touchGesture.previousY;

      touchGesture.previousY = touch.clientY;

      if (
        touchGesture.axis === "pending"
        && Math.max(horizontalDistance, verticalDistance)
          >= TOUCH_AXIS_LOCK_THRESHOLD
      ) {
        touchGesture.axis = verticalDistance >= horizontalDistance
          ? "vertical"
          : "horizontal";
      }

      if (
        touchGesture.axis === "vertical"
        && (
          !touchGesture.scrollArea
          || !canScrollInFingerDirection(
            touchGesture.scrollArea,
            fingerMovementY,
          )
        )
      ) {
        // Stop a fitted or boundary-starting region before Safari commits the
        // gesture to its visual viewport. Regions with room remain native;
        // overscroll containment handles a later boundary where possible.
        event.preventDefault();
      }
    };

    const clearTouchGesture = () => {
      touchGesture = null;
    };

    const installTouchGuard = () => {
      if (touchGuardInstalled) {
        return;
      }

      document.addEventListener("touchstart", handleTouchStart, {
        capture: true,
        passive: true,
      });
      document.addEventListener("touchmove", handleTouchMove, {
        capture: true,
        passive: false,
      });
      document.addEventListener("touchend", clearTouchGesture, {
        capture: true,
        passive: true,
      });
      document.addEventListener("touchcancel", clearTouchGesture, {
        capture: true,
        passive: true,
      });
      touchGuardInstalled = true;
    };

    const removeTouchGuard = () => {
      if (!touchGuardInstalled) {
        return;
      }

      document.removeEventListener("touchstart", handleTouchStart, true);
      document.removeEventListener("touchmove", handleTouchMove, true);
      document.removeEventListener("touchend", clearTouchGesture, true);
      document.removeEventListener("touchcancel", clearTouchGesture, true);
      touchGesture = null;
      touchGuardInstalled = false;
    };

    const syncTouchGuard = () => {
      if (isMobileConversationViewport()) {
        installTouchGuard();
      } else {
        removeTouchGuard();
      }
    };

    const handleViewportChange = () => {
      // Apply values available in this event immediately, then reconcile once
      // more in case Safari publishes its paired viewport value later.
      publishViewport();
      syncTouchGuard();
      scheduleFollowUp();
    };

    root.classList.add(ROOT_ACTIVE_CLASS);
    publishViewport();
    syncTouchGuard();

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange);
    window.addEventListener("orientationchange", handleViewportChange);
    window.visualViewport?.addEventListener("resize", handleViewportChange);
    window.visualViewport?.addEventListener("scroll", handleViewportChange);

    if (typeof mobileConversationMediaQuery?.addEventListener === "function") {
      mobileConversationMediaQuery.addEventListener("change", syncTouchGuard);
    } else {
      mobileConversationMediaQuery?.addListener(syncTouchGuard);
    }

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

      if (
        typeof mobileConversationMediaQuery?.removeEventListener === "function"
      ) {
        mobileConversationMediaQuery.removeEventListener(
          "change",
          syncTouchGuard,
        );
      } else {
        mobileConversationMediaQuery?.removeListener(syncTouchGuard);
      }

      removeTouchGuard();

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
