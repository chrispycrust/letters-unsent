"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

import ErrorDisplay from "@/components/ErrorDisplay";
import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";
import useConversationViewport from "@/components/LetterSubmit/useConversationViewport";
import ReleaseActionArea from "@/components/LetterSubmit/ReleaseFlow/ReleaseActionArea";
import { RELEASE_ERROR_MESSAGE } from "@/components/LetterSubmit/ReleaseFlow/errorMessages";
import type {
  ReadyLetterPayload,
  ReleaseSubmitInput,
  ReleaseSubmitResult,
} from "@/components/LetterSubmit/ReleaseFlow/types";

type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type GuardianPostResponse = {
  output: string;
  releaseReady?: boolean;
  letterPayload?: unknown;
  error?: string;
};

const initialConversation: ConversationMessage[] = [
  {
    role: "system",
    content: guardianSystemPrompt,
  },
];

const START_CONVERSATION_ERROR_MESSAGE =
  "We couldn’t start the conversation. Refresh the page and try again.";
const RESPONSE_ERROR_MESSAGE =
  "We couldn’t get a response. Your message is still here—please try sending it again.";

function normaliseOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normaliseReadyLetterPayload(payload: unknown): ReadyLetterPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;
  if (typeof record.content !== "string" || record.content.trim().length === 0) {
    return null;
  }

  return {
    content: record.content.trim(),
    intended_recipient: normaliseOptionalString(record.intended_recipient),
    author_name: normaliseOptionalString(record.author_name),
  };
}

export default function Submit() {
  const router = useRouter();

  const [coveMessage, setCoveMessage] = useState("");
  const [visitorInput, setVisitorInput] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>(initialConversation);
  const [responseOk, setResponseOk] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationStart, setConversationStart] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [pendingReleasePayload, setPendingReleasePayload] = useState<ReadyLetterPayload | null>(null);
  const [releaseLocked, setReleaseLocked] = useState(false);

  const hasActiveComposer = conversationStart && !pendingReleasePayload;
  useConversationViewport(hasActiveComposer);

  async function greetVisitor() {
    setIsComposerExpanded(false);
    setConversationStart(true);
    setResponseOk(false);
    setErrorMessage("");

    localStorage.setItem("visitCount", "1");
    localStorage.setItem("letterDraft", "hey you");

    const visitCount = localStorage.getItem("visitCount");

    try {
      const res = await fetch(`/api/guardian?&visitCount=${visitCount}`);
      const data = await res.json();

      if (res.ok) {
        setResponseOk(true);
        setErrorMessage("");
        setCoveMessage(data.output);
      } else {
        console.error("Guardian greeting request failed", {
          status: res.status,
          error: data.error,
        });
        setErrorMessage(START_CONVERSATION_ERROR_MESSAGE);
      }
    } catch (error) {
      console.error("Guardian greeting request failed", error);
      setErrorMessage(START_CONVERSATION_ERROR_MESSAGE);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!visitorInput.trim()) {
      return;
    }

    setIsComposerExpanded(false);
    setResponseOk(false);
    setErrorMessage("");

    const updatedConversation = [
      ...conversation,
      { role: "user", content: visitorInput.trim() } as ConversationMessage,
    ];

    try {
      const res = await fetch("/api/guardian/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ updatedConversation }),
      });

      const data = (await res.json()) as GuardianPostResponse;

      if (!res.ok) {
        console.error("Guardian response request failed", {
          status: res.status,
          error: data.error,
        });
        setCoveMessage("");
        setErrorMessage(RESPONSE_ERROR_MESSAGE);
        return;
      }

      const assistantMessage = typeof data.output === "string" ? data.output : "";
      const nextConversation = [
        ...updatedConversation,
        { role: "assistant", content: assistantMessage } as ConversationMessage,
      ];

      setResponseOk(true);
      setErrorMessage("");
      setConversation(nextConversation);
      setCoveMessage(assistantMessage);
      setVisitorInput("");

      const releasePayload = data.releaseReady
        ? normaliseReadyLetterPayload(data.letterPayload)
        : null;

      if (releasePayload && !releaseLocked) {
        setIsComposing(false);
        setIsComposerExpanded(false);
        setPendingReleasePayload(releasePayload);
      }
    } catch (error) {
      console.error("Guardian response request failed", error);
      setErrorMessage(RESPONSE_ERROR_MESSAGE);
    }
  }

  async function handleSubmitLetter(input: ReleaseSubmitInput): Promise<ReleaseSubmitResult> {
    if (!pendingReleasePayload) {
      console.error("Letter release attempted without a ready letter");
      throw new Error(RELEASE_ERROR_MESSAGE);
    }

    const requestBody = {
      content: pendingReleasePayload.content,
      intended_recipient: pendingReleasePayload.intended_recipient,
      author_name: pendingReleasePayload.author_name,
      owner_passphrase: input.ownerPassphrase,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await fetch("/api/supabase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        console.error("Letter release request failed", {
          status: res.status,
          error: data.error,
        });
        throw new Error(RELEASE_ERROR_MESSAGE);
      }

      const createdId =
        (typeof data.id === "string" && data.id) ||
        (typeof data.id === "number" && String(data.id)) ||
        (typeof data?.data?.[0]?.id === "string" && data.data[0].id) ||
        (typeof data?.data?.[0]?.id === "number" && String(data.data[0].id)) ||
        null;

      if (!createdId) {
        console.error("Letter release response did not include an id", data);
        throw new Error(RELEASE_ERROR_MESSAGE);
      }

      setReleaseLocked(true);

      return { id: createdId };
    } catch (error) {
      if (!(error instanceof Error && error.message === RELEASE_ERROR_MESSAGE)) {
        console.error("Letter release request failed", error);
      }

      throw new Error(RELEASE_ERROR_MESSAGE);
    }
  }

  function returnToConversation() {
    setIsComposing(false);
    setIsComposerExpanded(false);
    setPendingReleasePayload(null);
    setVisitorInput("");
  }

  function startNewLetterFlow() {
    setIsComposing(false);
    setIsComposerExpanded(false);
    setReleaseLocked(false);
    setPendingReleasePayload(null);
    setVisitorInput("");
    setErrorMessage("");
    setConversation(initialConversation);
    setCoveMessage("When you're ready, we can begin a new letter.");
    setResponseOk(true);
  }

  return (
    <div className={`submit-container ${conversationStart ? "conversation-active" : ""}`}>
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {conversationStart && !errorMessage
          ? (responseOk ? "Response ready." : "Preparing a response.")
          : ""}
      </div>
      {conversationStart ? (
        <div
          className={[
            "conversation-shell",
            isComposing ? "is-composing" : "",
            isComposerExpanded ? "is-editor-expanded" : "",
          ].filter(Boolean).join(" ")}
        >
          <div
            className="guardian-panel-container"
            aria-hidden={isComposerExpanded || undefined}
          >
            {errorMessage ? (
              <div className="guardian-error-container">
                <ErrorDisplay message={errorMessage} role="alert" />
              </div>
            ) : (
              <GuardianPanel message={coveMessage} responseStatus={responseOk} />
            )}
          </div>

          {pendingReleasePayload ? (
            <ReleaseActionArea
              letterPayload={pendingReleasePayload}
              onSubmitLetter={handleSubmitLetter}
              onReturnToConversation={returnToConversation}
              onViewLetter={(letterId) => router.push(`/letters/${letterId}`)}
            />
          ) : (
            <div className="conversation-footer">
              {releaseLocked ? (
                <div
                  className="post-release-note"
                  aria-hidden={isComposerExpanded || undefined}
                >
                  <p>This letter is now closed. You can keep talking with Cove.</p>
                  <button
                    type="button"
                    className="release-link-button post-release-action"
                    onClick={startNewLetterFlow}
                  >
                    Start a new letter
                  </button>
                </div>
              ) : null}

              <VisitorPanel
                visitorInput={visitorInput}
                setVisitorInput={setVisitorInput}
                handleSubmit={handleSubmit}
                onFocusChange={setIsComposing}
                isExpanded={isComposerExpanded}
                onExpandedChange={setIsComposerExpanded}
              />
            </div>
          )}
        </div>
      ) : (
        <div>
          <button
            id="conversation-start-button"
            type="button"
            onClick={greetVisitor}
            className="start-conversation-button"
          >
            Start conversation
          </button>
          <div className="submission_note">
            <p style={{ marginBottom: "0", paddingBottom: "0" }}>Submissions are not open yet.</p>
            <p style={{ marginTop: "0", paddingTop: "0" }}>
              You&apos;ll get a warning at the end advising that something went wrong.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
