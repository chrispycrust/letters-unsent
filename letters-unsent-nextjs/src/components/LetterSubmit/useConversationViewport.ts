"use client";

import { type RefObject, useEffect } from "react";

const VIEWPORT_PROPERTIES = [
  "--conversation-viewport-height",
  "--conversation-viewport-offset-top",
  "--conversation-viewport-bottom",
  "--conversation-keyboard-inset",
  "--conversation-visible-top-inset",
  "--conversation-available-height",
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
 * Publishes the visual viewport measurements used by the focused conversation
 * layout. `--conversation-visible-top-inset` describes how far the visual
 * viewport has panned below the shell's layout position, while
 * `--conversation-available-height` describes the remaining visible space from
 * the lower of those two top edges. Measurements are removed (or restored)
 * when the layout is inactive.
 */
export function useConversationViewport(
  elementRef: RefObject<HTMLElement | null>,
  active: boolean,
): void {
  useEffect(() => {
    const element = elementRef.current;

    if (!active || !element) {
      return;
    }

    const previousValues = new Map<ViewportProperty, PreviousPropertyValue>(
      VIEWPORT_PROPERTIES.map((property) => [
        property,
        {
          value: element.style.getPropertyValue(property),
          priority: element.style.getPropertyPriority(property),
        },
      ]),
    );

    let animationFrameId: number | null = null;
    let appliedVisibleTopInset = 0;

    const updateProperties = () => {
      animationFrameId = null;

      const visualViewport = window.visualViewport;
      const viewportHeight = visualViewport?.height ?? window.innerHeight;
      const viewportOffsetTop = visualViewport?.offsetTop ?? 0;
      const viewportBottom = viewportOffsetTop + viewportHeight;
      const keyboardInset = Math.max(0, window.innerHeight - viewportBottom);
      const elementTop =
        element.getBoundingClientRect().top - appliedVisibleTopInset;
      const visibleTop = Math.max(elementTop, viewportOffsetTop);
      const visibleTopInset = Math.max(0, viewportOffsetTop - elementTop);
      const availableHeight = Math.max(0, viewportBottom - visibleTop);

      element.style.setProperty(
        "--conversation-viewport-height",
        toCssPixels(viewportHeight),
      );
      element.style.setProperty(
        "--conversation-viewport-offset-top",
        toCssPixels(viewportOffsetTop),
      );
      element.style.setProperty(
        "--conversation-viewport-bottom",
        toCssPixels(viewportBottom),
      );
      element.style.setProperty(
        "--conversation-keyboard-inset",
        toCssPixels(keyboardInset),
      );
      element.style.setProperty(
        "--conversation-visible-top-inset",
        toCssPixels(visibleTopInset),
      );
      element.style.setProperty(
        "--conversation-available-height",
        toCssPixels(availableHeight),
      );

      appliedVisibleTopInset = visibleTopInset;
    };

    const scheduleUpdate = () => {
      if (animationFrameId !== null) {
        return;
      }

      animationFrameId = window.requestAnimationFrame(updateProperties);
    };

    updateProperties();

    window.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("resize", scheduleUpdate);
    window.visualViewport?.addEventListener("scroll", scheduleUpdate);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("resize", scheduleUpdate);
      window.visualViewport?.removeEventListener("scroll", scheduleUpdate);

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId);
      }

      for (const property of VIEWPORT_PROPERTIES) {
        const previousValue = previousValues.get(property);

        if (previousValue?.value) {
          element.style.setProperty(
            property,
            previousValue.value,
            previousValue.priority,
          );
        } else {
          element.style.removeProperty(property);
        }
      }
    };
  }, [active, elementRef]);
}

export default useConversationViewport;
