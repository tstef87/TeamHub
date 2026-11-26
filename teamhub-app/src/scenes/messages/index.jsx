import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import { Avatar, EmptyState } from "../../components/ui/misc";
import { cx, fullName, relativeTime } from "../../lib/format";

import {
  watchConversations,
  watchMessages,
  sendMessage,
  sendFirstMessage,
  directConversationId,
  deleteExpiredConversations,
} from "../../firestore/Messages";
import UserSearch from "../../components/search/UserSearch";


import { useAuth } from "../../context/AuthContext";

function titleFor(c, myUid) {
  if (c.title) return c.title;
  const others = c.participants.filter((p) => p !== myUid).map((p) => c.participantNames[p] ?? "Unknown");
  return others.join(", ") || "Just you";
}

export default function Messages() {
  const { conversationId } = useParams();
  const { user, displayName } = useAuth();
  const uid = user?.uid;
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [composing, setComposing] = useState(false);

  const location = useLocation();
  const draftWith = location.state?.draftWith;

  // Use the real conversation if it exists; otherwise show a draft for the person just picked
  const found = conversations.find((c) => c.id === conversationId) ?? null;
  const active =
    found ??
    (draftWith
      ? {
          id: conversationId,
          title: "",
          participants: [uid, draftWith.uid],
          participantNames: { [uid]: displayName, [draftWith.uid]: draftWith.name },
          draft: true,
        }
      : null);

  // Delete my expired conversations when the page opens
  useEffect(() => {
    if (!uid) return;
    deleteExpiredConversations(uid).catch((err) => console.error("Cleanup failed:", err));
  }, [uid]);

  // Live list of my conversations
  useEffect(() => {
    if (!uid) return;
    return watchConversations(uid, setConversations);
  }, [uid]);

  // Only listen for messages once the conversation really exists
  const exists = !!found;
  useEffect(() => {
    if (!conversationId || !exists) {
      setMessages([]);
      return;
    }
    return watchMessages(conversationId, setMessages);
  }, [conversationId, exists]);

  const handleSend = async (convId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const me = { uid, name: displayName };
    try {
      if (active?.draft) {
        await sendFirstMessage(me, draftWith, trimmed);
      } else {
        await sendMessage(convId, me, trimmed);
      }
    } catch (err) {
      console.error("Couldn't send message:", err);
    }
  };

  return (
    <div className="-mx-4 -mt-6 grid h-[calc(100dvh-3.5rem-4rem)] border-line sm:-mx-6 lg:mx-0 lg:mt-0 lg:h-[calc(100dvh-5rem)] lg:grid-cols-[320px_1fr] lg:overflow-hidden lg:rounded-2xl lg:border lg:bg-surface">
      {/* Conversation list */}
      <section className={cx("flex min-h-0 flex-col border-line bg-surface lg:border-r", conversationId && "hidden lg:flex")}>
        <header className="flex items-center justify-between border-b border-line px-4 py-4">
          <h1 className="text-2xl font-semibold">Messages</h1>
          <Button size="sm" onClick={() => setComposing(true)} aria-label="New message">
            <Icon name="plus" size={16} /> New
          </Button>
        </header>
        {composing && <NewConversation onClose={() => setComposing(false)} />}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {conversations.length ? (
            <ul>
              {conversations.map((c) => {
                const title = titleFor(c, uid);
                return (
                  <li key={c.id}>
                    <Link
                      to={`/Messages/${c.id}`}
                      className={cx(
                        "flex items-center gap-3 border-b border-line px-4 py-3",
                        c.id === conversationId ? "bg-crimson-soft" : "hover:bg-surface-sunk",
                      )}
                    >
                      <Avatar name={title} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate font-semibold">{title}</p>
                          <span className="shrink-0 text-xs text-muted">{relativeTime(c.updatedAt)}</span>
                        </div>
                        <p className="truncate text-sm text-muted">{c.lastMessage || "No messages yet"}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-4">
              <EmptyState icon="message" title="No conversations yet">
                Start one with New, or use Message on a team roster.
              </EmptyState>
            </div>
          )}
        </div>
      </section>

      {/* Thread */}
      <section className={cx("min-h-0 flex-col bg-page lg:bg-surface", conversationId ? "flex" : "hidden lg:flex")}>
        {conversationId ? (
          active ? (
            <Thread
              conversation={active}
              messages={messages}
              uid={uid}
              onSend={(text) => handleSend(active.id, text)}
            />
          ) : (
            <div className="p-6">
              <EmptyState icon="message" title="Conversation not found" action={<Link to="/Messages" className="font-semibold text-crimson-ink">Back to messages</Link>} />
            </div>
          )
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted">
            <Icon name="message" size={32} className="mb-3 text-crimson-ink" />
            Pick a conversation to read it.
          </div>
        )}
      </section>
    </div>
  );
}

function Thread({ conversation, messages, onSend, uid }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  const submit = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    onSend(draft);
    setDraft("");
  };

  const title = titleFor(conversation, uid);

  return (
    <>
      <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <Link to="/Messages" className="rounded-md p-1 text-muted hover:text-ink lg:hidden" aria-label="Back to conversations">
          <Icon name="chevronLeft" />
        </Link>
        <Avatar name={title} size={36} />
        <p className="truncate font-semibold">{title}</p>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length ? (
          <ol className="flex flex-col gap-2">
            {messages.map((m, i) => {
              const mine = m.senderId === uid;
              const showName = !mine && messages[i - 1]?.senderId !== m.senderId;
              return (
                <li key={m.id} className={cx("flex max-w-[80%] flex-col", mine ? "items-end self-end" : "items-start")}>
                  {showName && <span className="mb-0.5 px-1 text-xs font-semibold text-muted">{m.senderName}</span>}
                  <p
                    className={cx(
                      "whitespace-pre-line rounded-2xl px-3.5 py-2 text-[15px]",
                      mine ? "rounded-br-md bg-crimson text-white" : "rounded-bl-md border border-line bg-surface lg:bg-surface-sunk lg:border-transparent",
                    )}
                  >
                    {m.text}
                  </p>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="pt-10 text-center text-muted">Say hello. Messages here are only visible to people in this conversation.</p>
        )}
        <div ref={endRef} />
      </div>

      <form onSubmit={submit} className="flex items-end gap-2 border-t border-line bg-surface p-3">
        <label className="sr-only" htmlFor="draft">
          Message
        </label>
        <textarea
          id="draft"
          rows={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Write a message"
          className="max-h-32 min-h-10 flex-1 resize-none rounded-lg border border-line bg-surface px-3.5 py-2 text-[15px] focus:border-crimson focus:outline-none focus:ring-2 focus:ring-crimson/25"
        />
        <Button type="submit" disabled={!draft.trim()} aria-label="Send message" className="h-10 w-10 px-0">
          <Icon name="send" size={18} />
        </Button>
      </form>
    </>
  );
}

function NewConversation({ onClose }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Open draft
  const start = (p) => {
    if (!user || !p.uid) return;
    const id = directConversationId(user.uid, p.uid);
    onClose();
    navigate(`/Messages/${id}`, { state: { draftWith: { uid: p.uid, name: fullName(p) || p.id } } });
  };

  return (
    <div className="border-b border-line bg-surface-sunk p-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <label htmlFor="dm-search" className="sr-only">Search people</label>
          <UserSearch
            id="dm-search"
            autoFocus
            excludeIds={profile?.username ? [profile.username] : []}
            onSelect={start}
          />
        </div>
        <button onClick={onClose} className="rounded-md p-1.5 text-muted hover:text-ink" aria-label="Close search">
          <Icon name="x" size={18} />
        </button>
      </div>
    </div>
  );
}
