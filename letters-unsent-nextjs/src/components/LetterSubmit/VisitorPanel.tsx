import { useLayoutEffect, useRef, useState } from "react";
import MaximiseIcon from "../../../public/icons/arrows-maximise";
import RespondIcon from "../../../public/icons/RespondIcon";
import MinimiseIcon from "../../../public/icons/arrows-minimise";

export const MOBILE_CONVERSATION_QUERY =
  "(max-width: 650px), (pointer: coarse) and (max-height: 650px)";

interface VisitorInputProps {
  visitorInput: string;
  setVisitorInput: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onFocusChange?: (focused: boolean) => void;
}

function isMobileConversationViewport(): boolean {
  if (typeof window === "undefined") {
    return false;
  }"function"

  if (typeof window.matchMedia === "function") {
    return window.matchMedia(MOBILE_CONVERSATION_QUERY).matches;
  }

  return window.innerWidth <= 650;
}

export default function VisitorPanel({
  visitorInput,
  setVisitorInput,
  handleSubmit,
  onFocusChange,
}: VisitorInputProps) {
  const [expandButtonActive, setExpandButtonActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea || expandButtonActive || !isMobileConversationViewport()) {
      textarea?.style.removeProperty("height");
      textarea?.style.removeProperty("overflow-y");
      return;
    }

    textarea.style.height = "auto";

    const maximumHeight = Number.parseFloat(window.getComputedStyle(textarea).maxHeight);
    const contentHeight = textarea.scrollHeight;
    const nextHeight = Number.isFinite(maximumHeight)
      ? Math.min(contentHeight, maximumHeight)
      : contentHeight;

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = Number.isFinite(maximumHeight) && contentHeight > maximumHeight
      ? "auto"
      : "hidden";
  }, [expandButtonActive, visitorInput]);

  function submitVisitorResponse(event: React.FormEvent<HTMLFormElement>) {
    const hasResponse = visitorInput.trim().length > 0;

    handleSubmit(event);

    if (hasResponse && isMobileConversationViewport()) {
      textareaRef.current?.blur();
    }
  }

  return (
    <form
      onSubmit={submitVisitorResponse}
      className={`visitor-input-container ${
        expandButtonActive ? "vistor-input-container-expanded" : ""
      }`}
    >
      <div className="visitor-input-area">
        <textarea
          ref={textareaRef}
          id="VisitorInput"
          className={`visitor-textarea ${
            expandButtonActive ? "vistor-textarea-expanded" : ""
          }`}
          name="input area"
          rows={1}
          required
          value={visitorInput}
          onChange={(event) => setVisitorInput(event.target.value)}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          placeholder="Write something"
          spellCheck="true"
        />

        <div className="buttons-container">
          {expandButtonActive ? (
            <button
              type="button"
              value="minimise text area"
              className="button-input-area button-change-textarea"
              onClick={() => setExpandButtonActive(false)}
              title="click to minimise the text area"
              aria-label="click to minimise the text area"
            >
              <MinimiseIcon />
            </button>
          ) : (
            <button
              type="button"
              value="expand text area"
              className="button-input-area button-change-textarea"
              onClick={() => setExpandButtonActive(true)}
              title="click to maximise the text area"
              aria-label="click to maximise the text area"
            >
              <MaximiseIcon />
            </button>
          )}

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
