# Nexus Docs - High-End Feature Architecture (Phase 2)

This document outlines the architectural strategy and UI/UX flows for the Pro-tier capabilities introduced in Nexus Docs.

---

## 1. Core Editor Augmentations

### A. Ghost Text AI Auto-Complete (Copilot-style)
**UI/UX Flow:**
1. **Trigger:** As the user pauses typing (300ms debounce), the editor captures the current line context (last 200 words).
2. **AI Request:** A background request is sent to the Nexus AI engine (Gemini Flash for low latency).
3. **Ghost Render:** The predicted text is rendered as a "phantom" node in the TipTap editor using a custom inline decoration with `pointer-events-none` and `opacity-30`.
4. **Acceptance:** If the user presses `Tab`, the phantom text is committed to the document state. If the user continues typing, the phantom text is instantly destroyed.

**Architecture:**
* **Client-side:** TipTap `Plugin` that manages the `DecorationSet`.
* **Backend:** SSE (Server-Sent Events) or a high-performance REST endpoint that streams tokens for near-instant ghost text.

### B. Bi-Directional Linking (`[[ ]]`)
**UI/UX Flow:**
1. **Activation:** Typing `[[` triggers a Portal-rendered dropdown menu.
2. **Search:** Real-time fuzzy filtering through the local document cache + Firebase Search index.
3. **Linking:** Selecting a document name inserts a specialized `Mention` extension node.
4. **Backlink Logic:** Upon document save, a cloud function parses all `[[ ]]` nodes and updates the `backlinks` sub-collection for the target document.

---

## 2. Multiplayer & Collaboration Mastery

### A. Live Presence & Cursors
**Strategy:**
* **Real-time State:** Use the `realtime` database or Firestore `onSnapshot` with a throttle (50ms).
* **Identity:** Each cursor is a floating `div` with a specific color assigned based on the user's `uid`.
* **Conflict Resolution (CRDT):** Integrate `Yjs` (shared types) with the TipTap editor. Yjs handles the hard work of merging character insertions/deletions across multiple clients without data loss.
* **Presence:** A separate `presence` collection tracks `lastActiveAt` and `cursorPosition` {x, y, lineIndex}.

### B. In-Doc Audio Huddles (WebRTC)
**Architecture:**
* **Signaling:** Use Firestore as a signaling channel (ICE candidates, offers, answers).
* **Stream:** Peer-to-Peer audio connection. One client acts as the "room master" for the specific `documentId`.
* **UI:** A subtle "Huddle active" wave animation in the document header.

---

## 3. Dedicated Systems & Analytics

### A. Obsidian-Style Knowledge Graph (`/graph`)
* **Engine:** D3.js Force-Directed Graph.
* **Nodes:** Fetched from the `/documents` collection. Weight is determined by the number of backlinks.
* **Edges:** Connections derived from the `Backlink` entity mappings.
* **Interaction:** Clicking a node navigates to `/doc/{id}` using Framer Motion layout transitions.

### B. Offline-First PWA (Progressive Web App)
* **Storage:** Workbox for service worker caching. IndexedDB (via Dexie.js or local Firebase persistence) for document content.
* **Sync Strategy:** Use a `Mutation Queue`. If a write fails due to `offline` status, store the action in IndexedDB. Upon `online` event, replay the queue to Firebase. 

---

## 4. Infrastructure & Publishing

### A. Publish to Web & Custom Domains
* **Publication Engine:** A "Snapshot" of the document is generated and stored in a public-read collection.
* **Custom Domains:** CNAME pointing to the Nexus Cloud Run instance. Middleware intercepts the `host` header to resolve the correct `documentId`.

---

## 5. Security & E2EE
* **E2EE Links:** The document content is encrypted using `AES-GCM` before upload. The password is never sent to the server. The sharing link contains the `initialization vector (IV)`. The recipient must enter the password to decrypt the payload in their browser memory.
