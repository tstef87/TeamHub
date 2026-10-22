import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import Icon from "../../components/ui/Icon";
import { Avatar, EmptyState, RoleBadge } from "../../components/ui/misc";
import { cx, fullName, relativeTime } from "../../lib/format";

// TODO(backend): Remove the sample data below and the in-memory state in <Messages />.
// Original services (services/messages) and how they were used:
//   const { user, displayName } = useAuth();                 // who is signed in
//   watchConversations(uid, setConversations)                // live list of this user's conversations
//   watchMessages(conversationId, setMessages)               // live messages for the open conversation
//   sendMessage(conversationId, { uid, name }, text)         // save a new message
//   searchPeople(term, uid)                                  // find people to message (excludes self)
//   openDirectConversation(me, other)                        // find or create a 1-on-1 conversation, returns its id
// The watch functions return an unsubscribe function, so return them from useEffect.
// Also restore the <Spinner /> (from ui/misc) while conversations or messages are still loading (null),
// and the "Conversation not found" state once loading finishes and the id doesn't match.

const uid = "me";
const displayName = "Alex";

const HOUR = 60 * 60 * 1000;
const now = Date.now();

const SAMPLE_PEOPLE = [
  { uid: "u1", firstName: "Jordan", lastName: "Rivera", username: "coach.rivera", role: "coach" },
  { uid: "u2", firstName: "Jamie", lastName: "Lee", username: "jamie.lee", role: "player" },
  { uid: "u3", firstName: "Sam", lastName: "Patel", username: "spatel", role: "follower" },
];

const SAMPLE_CONVERSATIONS = [
  {
    id: "c1",
    title: "",
    participants: [uid, "u1"],
    participantNames: { [uid]: displayName, u1: "Jordan Rivera" },
    lastMessage: "See you at practice.",
    updatedAt: new Date(now - 1 * HOUR),
  },
  {
    id: "c2",
    title: "Hockey Carpool",
    participants: [uid, "u2", "u3"],
    participantNames: { [uid]: displayName, u2: "Jamie Lee", u3: "Sam Patel" },
    lastMessage: "I can drive Thursday.",
    updatedAt: new Date(now - 26 * HOUR),
  },
];

const SAMPLE_MESSAGES = {
  c1: [
    { id: "m1", senderId: "u1", senderName: "Jordan Rivera", text: "Practice moved to 7 PM this week." },
    { id: "m2", senderId: uid, senderName: displayName, text: "Got it, thanks!" },
    { id: "m3", senderId: "u1", senderName: "Jordan Rivera", text: "See you at practice." },
  ],
  c2: [
    { id: "m4", senderId: "u2", senderName: "Jamie Lee", text: "Who can drive Thursday?" },
    { id: "m5", senderId: "u3", senderName: "Sam Patel", text: "I can drive Thursday." },
  ],
};

function titleFor(c, myUid) {
  if (c.title) return c.title;
  const others = c.participants.filter((p) => p !== myUid).map((p) => c.participantNames[p] ?? "Unknown");
  return others.join(", ") || "Just you";
}

export default function Messages() {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState(SAMPLE_CONVERSATIONS);
  const [messagesById, setMessagesById] = useState(SAMPLE_MESSAGES);
  const [composing, setComposing] = useState(false);

  const active = conversations.find((c) => c.id === conversationId) ?? null;

  // TODO(backend): Replace with sendMessage(conversationId, { uid, name: displayName }, text).
  // The live watchMessages / watchConversations listeners will then update the UI on their own.
  const handleSend = (convId, text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const message = { id: `m${Date.now()}`, senderId: uid, senderName: displayName, text: trimmed };
    setMessagesById((prev) => ({ ...prev, [convId]: [...(prev[convId] ?? []), message] }));
    setConversations((prev) =>
      prev
        .map((c) => (c.id === convId ? { ...c, lastMessage: trimmed, updatedAt: new Date() } : c))
        .sort((a, b) => b.updatedAt - a.updatedAt),
    );
  };

  // TODO(backend): Replace with openDirectConversation(me, other), which finds or creates the
  // conversation and returns its id.
  const handleStartConversation = (person) => {
    const existing = conversations.find(
      (c) => !c.title && c.participants.length === 2 && c.participants.includes(person.uid),
    );
    if (existing) return existing.id;
    const id = `c${Date.now()}`;
    setConversations((prev) => [
      {
        id,
        title: "",
        participants: [uid, person.uid],
        participantNames: { [uid]: displayName, [person.uid]: fullName(person) },
        lastMessage: "",
        updatedAt: new Date(),
      },
      ...prev,
    ]);
    return id;
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
        {composing && <NewConversation onClose={() => setComposing(false)} onStart={handleStartConversation} />}
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
              messages={messagesById[active.id] ?? []}
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

function Thread({ conversation, messages, onSend }) {
  const [draft, setDraft] = useState("");
  const endRef = useRef(null);
  // TODO(backend): Add `const [sending, setSending] = useState(false);`, make submit async, wrap the
  // send in try/catch/finally, and pass `loading={sending}` to the send <Button>.

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

function NewConversation({ onClose, onStart }) {
}