import { useLayoutEffect, useRef } from "react";
import MaximiseIcon from "../../../public/icons/arrows-maximise";
import RespondIcon from "../../../public/icons/RespondIcon";
import MinimiseIcon from "../../../public/icons/arrows-minimise";
import { MOBILE_CONVERSATION_QUERY } from "./useConversationViewport";

interface VisitorInputProps {
  visitorInput: string;
  setVisitorInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFocusChange?: (focused: boolean) => void;
  isExpanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
}

type PendingEditorState = {
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: "forward" | "backward" | "none";
  scrollTop: number | null;
  wasFocused: boolean;
};

type EditorMode = "compact" | "expanded";

type EditorModeSnapshot = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
  selectionDirection: "forward" | "backward" | "none";
  scrollTop: number;
};

function isMobileConversationViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(MOBILE_CONVERSATION_QUERY).matches;
  }

  return window.innerWidth <= 650;
}

function updateTextareaSize(
  textarea: HTMLTextAreaElement,
  isExpanded: boolean,
) {
  if (isExpanded || !isMobileConversationViewport()) {
    textarea.style.removeProperty("height");
    textarea.style.removeProperty("overflow-y");
    return;
  }

  textarea.style.height = "auto";

  const computedStyle = window.getComputedStyle(textarea);
  const minimumHeight = Number.parseFloat(computedStyle.minHeight);
  const maximumHeight = Number.parseFloat(computedStyle.maxHeight);
  const contentHeight = textarea.scrollHeight;
  const heightWithinMaximum = Number.isFinite(maximumHeight)
    ? Math.min(contentHeight, maximumHeight)
    : contentHeight;
  const nextHeight = Number.isFinite(minimumHeight)
    ? Math.max(minimumHeight, heightWithinMaximum)
    : heightWithinMaximum;

  textarea.style.height = `${nextHeight}px`;
  textarea.style.overflowY = Number.isFinite(maximumHeight) && contentHeight > maximumHeight
    ? "auto"
    : "hidden";
}

export default function VisitorPanel({
  visitorInput,
  setVisitorInput,
  handleSubmit,
  onFocusChange,
  isExpanded,
  onExpandedChange,
}: VisitorInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingEditorStateRef = useRef<PendingEditorState | null>(null);
  const modeSnapshotRef = useRef<Record<EditorMode, EditorModeSnapshot | null>>({
    compact: null,
    expanded: null,
  });

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    if (visitorInput.length === 0) {
      modeSnapshotRef.current.compact = null;
      modeSnapshotRef.current.expanded = null;
    }

    updateTextareaSize(textarea, isExpanded);

    const pendingEditorState = pendingEditorStateRef.current;

    if (!pendingEditorState) {
      return;
    }

    textarea.setSelectionRange(
      pendingEditorState.selectionStart,
      pendingEditorState.selectionEnd,
      pendingEditorState.selectionDirection,
    );

    if (pendingEditorState.wasFocused && document.activeElement !== textarea) {
      textarea.focus({ preventScroll: true });
    }

    if (pendingEditorState.scrollTop !== null) {
      textarea.scrollTop = pendingEditorState.scrollTop;
    }

    pendingEditorStateRef.current = null;
  }, [isExpanded, visitorInput]);

  useLayoutEffect(() => {
    if (typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_CONVERSATION_QUERY);
    const handleViewportModeChange = () => {
      const textarea = textareaRef.current;

      if (textarea) {
        updateTextareaSize(textarea, isExpanded);
      }
    };

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleViewportModeChange);

      return () => {
        mediaQuery.removeEventListener("change", handleViewportModeChange);
      };
    }

    mediaQuery.addListener(handleViewportModeChange);

    return () => {
      mediaQuery.removeListener(handleViewportModeChange);
    };
  }, [isExpanded]);

  function submitVisitorResponse(event: React.FormEvent<HTMLFormElement>) {
    const hasResponse = visitorInput.trim().length > 0;

    handleSubmit(event);

    if (hasResponse && isMobileConversationViewport()) {
      textareaRef.current?.blur();
    }
  }

  function focusWithoutSafariScroll(
    event: React.PointerEvent<HTMLTextAreaElement>,
  ) {
    const textarea = textareaRef.current;

    if (
      event.pointerType !== "touch"
      || !event.isPrimary
      || !textarea
      || document.activeElement === textarea
      || textarea.value.length > 0
      || !isMobileConversationViewport()
    ) {
      return;
    }

    // Safari normally scrolls the page before revealing the software keyboard.
    // Replace that first empty-composer touch only. A non-empty draft keeps
    // native touch handling so Safari can place the caret where it was tapped.
    event.preventDefault();
    textarea.focus({ preventScroll: true });
  }

  function keepEditorFocusDuringPointerToggle(
    event: React.PointerEvent<HTMLButtonElement>,
  ) {
    if (
      event.isPrimary
      && event.button === 0
      && document.activeElement === textareaRef.current
    ) {
      event.preventDefault();
    }
  }

  function toggleExpandedEditor() {
    const textarea = textareaRef.current;

    if (textarea) {
      const currentMode: EditorMode = isExpanded ? "expanded" : "compact";
      const nextMode: EditorMode = isExpanded ? "compact" : "expanded";
      const currentSnapshot: EditorModeSnapshot = {
        value: visitorInput,
        selectionStart: textarea.selectionStart,
        selectionEnd: textarea.selectionEnd,
        selectionDirection: textarea.selectionDirection,
        scrollTop: textarea.scrollTop,
      };
      const nextModeSnapshot = modeSnapshotRef.current[nextMode];
      const canRestoreNextModeScroll = nextModeSnapshot?.value === visitorInput
        && nextModeSnapshot.selectionStart === currentSnapshot.selectionStart
        && nextModeSnapshot.selectionEnd === currentSnapshot.selectionEnd
        && nextModeSnapshot.selectionDirection === currentSnapshot.selectionDirection;

      modeSnapshotRef.current[currentMode] = currentSnapshot;

      pendingEditorStateRef.current = {
        selectionStart: currentSnapshot.selectionStart,
        selectionEnd: currentSnapshot.selectionEnd,
        selectionDirection: currentSnapshot.selectionDirection,
        scrollTop: canRestoreNextModeScroll
          ? nextModeSnapshot.scrollTop
          : null,
        wasFocused: document.activeElement === textarea,
      };
    }

    onExpandedChange(!isExpanded);
  }

  return (
    <form
      onSubmit={submitVisitorResponse}
      className={`visitor-input-container${isExpanded ? " is-expanded" : ""}`}
    >
      <div className="visitor-input-area">
        <textarea
          ref={textareaRef}
          id="VisitorInput"
          className="visitor-textarea"
          data-conversation-scroll-region="visitor"
          name="input area"
          rows={1}
          required
          value={visitorInput}
          onPointerDown={focusWithoutSafariScroll}
          onChange={(event) => setVisitorInput(event.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder="Write something"
          spellCheck="true"
        />

        <div className="buttons-container">
          <button
            type="button"
            value={isExpanded ? "minimise text area" : "expand text area"}
            className="button-input-area button-change-textarea"
            onPointerDown={keepEditorFocusDuringPointerToggle}
            onClick={toggleExpandedEditor}
            title={isExpanded ? "Minimise writing area" : "Expand writing area"}
            aria-label={isExpanded ? "Minimise writing area" : "Expand writing area"}
            aria-expanded={isExpanded}
            aria-controls="VisitorInput"
          >
            {isExpanded ? <MinimiseIcon /> : <MaximiseIcon />}
          </button>

          <button
            type="submit"
            value="submit a response"
            className="submit-button"
            title="click to submit a response to Cove (AI presence)"
            aria-label="click to submit a response to Cove (AI presence)"
          >
            <RespondIcon />
          </button>
        </div>
      </div>
    </form>
  );
}
