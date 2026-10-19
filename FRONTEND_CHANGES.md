# TeamHub frontend: React + TypeScript + Tailwind (SJU theme)

This replaces the old MUI/Radix JSX frontend in `teamhub-app/` with TypeScript and Tailwind CSS v4.
Firebase stays the same: the same project (`teamhub-29f2a`), the same Auth setup, and the same
Firestore collections and fields that the team's code already writes.

## Before you commit (important)

1. **Run `npm install` inside `teamhub-app/`.** This updates `package-lock.json` to match the new
   `package.json`. CI runs `npm ci`, and `npm ci` fails if the lock file is out of date, so commit
   the updated lock file too.
2. Run `npm run typecheck` and `npm run build`. Fix anything they report. I couldn't run the
   TypeScript compiler in my environment because npm was blocked. The pages were bundled and
   clicked through in a browser, but they weren't type-checked.
3. Run `npm run dev` and log in with a real `@sju.edu` account.

## What changed

**Removed:** the MUI, Emotion, Radix, react-spring, prop-types and lucide-react dependencies.
Also removed: every `.jsx` scene, `theme.js`, `App.css`, the Vite starter assets, and the
duplicate `scenes/Elements` and `scenes/elements` folders. Those two folder names differ only by
capitalization, which breaks on macOS and Windows.

**Added:** `typescript`, `tailwindcss` and `@tailwindcss/vite`, `typescript-eslint`, and
`@types/node`. Fonts (Lora and Inter, under the SIL Open Font License) and SJU logos are
self-hosted in `src/assets`. Nothing loads from a CDN.

**Routes:** the old routes keep the same URLs.

| Path | Page | Who |
| --- | --- | --- |
| `/Login` | Log in, forgot password | everyone |
| `/Create-Account` | Sign up (`@sju.edu` only, unique username) | everyone |
| `/` | Dashboard: updates and upcoming events from followed teams | signed in |
| `/Teams` | Team directory with search and Sports/Clubs/Following filters | signed in |
| `/Teams/Create-Team` | Create team (+ .ics schedule upload, invite players) | coaches |
| `/teams/:teamId` | Team page: Updates, Schedule, Roster, About; Follow button | signed in |
| `/Messages`, `/Messages/:id` | Direct messages | signed in |
| `/Profile` | Profile and followed teams | signed in |

Signed-out visitors who open any signed-in page are sent to `/Login`, then returned to the page
they wanted after logging in.

## Folder layout

```
src/
  firebase.ts            same config as before
  types.ts               shared data shapes (existing vs proposed fields marked)
  services/              ALL Firebase reads/writes live here
    auth.ts              sign in/up/out, reset password (logic from old login + create_acc)
    teams.ts             ported from firestore/Teams.js + follow, roster, announcements
    messages.ts          conversations + messages
  context/AuthContext.tsx  current user + users/{uid} profile + role
  components/ui/         Button, fields, Icon, Avatar, badges, empty states
  components/layout/     AppShell (sidebar / mobile tab bar), AuthLayout
  components/team/       team crest, event item, announcement card, CalendarUpload
  lib/                   activities list (same ids as before), formatting helpers
  scenes/                one folder per page (same naming as before)
```

Pages never call Firebase directly. They only call functions in `services/`. If the backend or
messaging leads change the schema or move logic into Cloud Functions, only those files need to
change.

## Data: existing vs proposed

These are unchanged and fully compatible:
- `users/{uid}` has `firstName`, `lastName`, `email`, `username`.
- `usernames/{username}` has `uid`.
- `teams/{id}` has `name`, `description`, `org_cat`, `org`, `followers`. The id comes from
  `teamIdFromName`, the same as before.
- `teams/{id}/events/*` uses the same shape the `.ics` parser produced before.

**Proposed** (check these with the backend, database and messaging leads):

- `users/{uid}.role`: `"coach" | "player" | "follower"`. A missing value is treated as follower.
  Sign-up lets people pick player or fan. Coach access should be granted by an admin, or set in
  the console for now.
- `users/{uid}.followedTeams: string[]`. Follow and Unfollow also increment or decrement
  `teams/{id}.followers`.
- `teams/{id}.ownerId`, set on create. This was already commented out in the old `createTeam`.
- `teams/{id}/announcements/*` has `title`, `body`, `pinned`, `authorId`, `authorName`,
  `createdAt`.
- `teams/{id}/roster/*` has `name`, `email`, `role`, `number?`, `position?`, `uid?`. The
  Message button appears when `uid` is set.
- `conversations/{id}` has `participants[]`, `participantNames{}`, `teamId`, `title`,
  `lastMessage`, `updatedAt`. Direct-message ids are the two uids, sorted and joined with `_`.
- `conversations/{id}/messages/*` has `senderId`, `senderName`, `text`, `createdAt`.

**Security note for the backend lead:** the role checks in the UI only hide buttons. They don't
stop anyone from writing. Firestore security rules must enforce who can post announcements,
create teams, and read conversations. Also, `database.rules.json` contains Realtime Database
rules. It does not contain Firestore rules.

## Theme

The colors are CSS variables in `src/index.css`, and they switch automatically for dark mode.
Use them through Tailwind class names: `bg-crimson`, `text-crimson-ink`, `bg-crimson-deep`,
`bg-surface`, `bg-page`, `text-ink`, `text-muted`, `border-line`, `text-gold`, `bg-gold-soft`.

- Crimson `#9E1B32` is the same value the old theme used.
- The sidebar, team banners and login panel also use crimson `#9E1B32`.
- Gold `#B9862A`, taken from the seal, is used only for pinned items and the active navigation
  marker.
- Headings use Lora (serif) and body text uses Inter.
