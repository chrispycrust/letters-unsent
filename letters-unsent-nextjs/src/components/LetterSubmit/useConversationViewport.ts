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

    const updateProperties = () => {
      animationFrameId = null;

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

      root.style.setProperty(
        "--conversation-viewport-height",
        toCssPixels(viewportHeight),
      );
      root.style.setProperty(
        "--conversation-viewport-page-top",
        toCssPixels(viewportPageTop),
      );
      root.style.setProperty(
        "--conversation-viewport-bottom",
        toCssPixels(viewportBottom),
      );
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateProperties);
    };

    root.classList.add(ROOT_ACTIVE_CLASS);
    updateProperties();

    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate);
    window.addEventListener("orientationchange", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleUpdate);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("orientationchange", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);

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
