"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

import ErrorDisplay from "@/components/ErrorDisplay";
import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";
import useConversationViewport from "@/components/LetterSubmit/useConversationViewport";
import ReleaseActionArea from "@/components/LetterSubmit/ReleaseFlow/ReleaseActionArea";
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
  const conversationShellRef = useRef<HTMLDivElement>(null);

  const [coveMessage, setCoveMessage] = useState("");
  const [visitorInput, setVisitorInput] = useState("");
  const [conversation, setConversation] = useState<ConversationMessage[]>(initialConversation);
  const [responseOk, setResponseOk] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationStart, setConversationStart] = useState(false);
  const [isComposing, setIsComposing] = useState(false);
  const [pendingReleasePayload, setPendingReleasePayload] = useState<ReadyLetterPayload | null>(null);
  const [releaseLocked, setReleaseLocked] = useState(false);

  const hasActiveComposer = conversationStart && !pendingReleasePayload;
  useConversationViewport(conversationShellRef, hasActiveComposer && isComposing);

  async function greetVisitor() {
    setConversationStart(true);

    localStorage.setItem("visitCount", "1");
    localStorage.setItem("letterDraft", "hey you");

    const visitCount = localStorage.getItem("visitCount");

    try {
      const res = await fetch(`/api/guardian?&visitCount=${visitCount}`);
      const data = await res.json();

      if (res.ok) {
        setResponseOk(true);
        setCoveMessage(data.output);
      } else {
        setErrorMessage(`Server error: ${data.error}`);
      }
    } catch (error) {
      setErrorMessage(`Network error: ${error}`);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!visitorInput.trim()) {
      return;
    }

    setResponseOk(false);

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
        setCoveMessage("");
        setErrorMessage(`Failed to load response from API: ${data.error ?? "Unknown error"}`);
        return;
      }

      const assistantMessage = typeof data.output === "string" ? data.output : "";
      const nextConversation = [
        ...updatedConversation,
        { role: "assistant", content: assistantMessage } as ConversationMessage,
      ];

      setResponseOk(true);
      setConversation(nextConversation);
      setCoveMessage(assistantMessage);
      setVisitorInput("");

      const releasePayload = data.releaseReady
        ? normaliseReadyLetterPayload(data.letterPayload)
        : null;

      if (releasePayload && !releaseLocked) {
        setIsComposing(false);
        setPendingReleasePayload(releasePayload);
      }
    } catch (error) {
      setErrorMessage(`Network error: ${error}`);
    }
  }

  async function handleSubmitLetter(input: ReleaseSubmitInput): Promise<ReleaseSubmitResult> {
    if (!pendingReleasePayload) {
      throw new Error("No letter is ready to be released.");
    }

    const requestBody = {
      content: pendingReleasePayload.content,
      intended_recipient: pendingReleasePayload.intended_recipient,
      author_name: pendingReleasePayload.author_name,
      owner_passphrase: input.ownerPassphrase,
      created_at: new Date().toISOString(),
    };

    const res = await fetch("/api/supabase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error ?? "Could not release your letter.");
    }

    const createdId =
      (typeof data.id === "string" && data.id) ||
      (typeof data.id === "number" && String(data.id)) ||
      (typeof data?.data?.[0]?.id === "string" && data.data[0].id) ||
      (typeof data?.data?.[0]?.id === "number" && String(data.data[0].id)) ||
      null;

    if (!createdId) {
      throw new Error("Could not find the new letter id.");
    }

    setReleaseLocked(true);

    return { id: createdId };
  }

  function returnToConversation() {
    setIsComposing(false);
    setPendingReleasePayload(null);
    setVisitorInput("");
  }

  function startNewLetterFlow() {
    setIsComposing(false);
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
      {errorMessage ? <ErrorDisplay message={errorMessage} /> : null}

      {conversationStart ? (
        <div
          ref={conversationShellRef}
          className={`conversation-shell ${isComposing ? "is-composing" : ""}`}
        >
          <div className="guardian-panel-container">
            <GuardianPanel message={coveMessage} responseStatus={responseOk} />
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
                <div className="post-release-note">
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
