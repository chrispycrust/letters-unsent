"use client";

import { useEffect } from "react";

const ROOT_ACTIVE_CLASS = "conversation-viewport-active";

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

function toCssPixels(value: number): string {
  const roundedValue = Math.round(Math.max(0, value) * 100) / 100;
  return `${roundedValue}px`;
}

/**
 * Publishes the visible mobile viewport as document coordinates.
 *
 * The conversation stage consumes these raw measurements directly. The hook
 * deliberately does not measure or move the conversation shell, so focusing
 * the textarea cannot create a measure-transform-measure feedback loop.
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

    const publishViewport = () => {
      const visualViewport = window.visualViewport;
      const viewportHeight = visualViewport?.height ?? window.innerHeight;

      // `pageTop` is the visible viewport's document position. Some Safari
      // versions publish it after `scrollY`, so use whichever has advanced
      // furthest during the keyboard animation.
      const viewportPageTop = Math.max(
        window.scrollY,
        visualViewport?.pageTop ?? window.scrollY,
      );
      const viewportBottom = viewportPageTop + viewportHeight;

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
      // Safari can paint its focus scroll before a queued animation-frame
      // update. Publish the available measurements during the event so the
      // stage follows that scroll without an intermediate off-screen frame.
      publishViewport();

      // Safari may refine VisualViewport values after the first event. Keep a
      // single follow-up pass to reconcile those later measurements.
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
