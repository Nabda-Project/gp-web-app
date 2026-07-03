# NABDA Doctor Web — Architecture and Technology Stack

This document describes the architecture of the NABDA Doctor Web portal and the reasoning behind each major technology choice. It is written to be lifted into a graduation-project report; every claim is grounded in a file path in this repository so the reviewer can verify it directly.

---

## 1. System overview

The NABDA project consists of two client applications sharing a single Spring-based REST + WebSocket backend:

- A **Flutter mobile application** used by patients (and, historically, by doctors).
- **This Next.js web application**, which exposes the *doctor-only* surface of the system to any modern web browser.

The web app was rebuilt from Flutter source using a curated extraction (see `web-rebuild-context/`) so that no patient-only screens or endpoints appear in the web build. Its scope covers doctor authentication, patient roster, patient detail, live vitals, AI report history, chats, appointments, notifications, profile, and settings.

The web app never talks to the database directly; it consumes the same REST endpoints and STOMP topics as the mobile app.

---

## 2. Technology stack

| Layer | Choice | Version | Purpose |
|---|---|---|---|
| Language | TypeScript | 5.8 | Static typing for domain models and API contracts. |
| UI framework | React | 19 | Component model. |
| Meta-framework | Next.js (App Router) | 15.5 | Routing, code-splitting, server-side rewrites, image / font optimisation. |
| Styling | Tailwind CSS | 3.4 | Utility-first CSS with design tokens matching the NABDA palette. |
| Icons | Material Symbols Rounded (via Google Fonts) | — | Visual parity with the Flutter Material icon set. |
| Realtime | @stomp/stompjs + sockjs-client | 7.1 / 1.6 | STOMP-over-WebSocket for chat, live vitals, and presence, matching the backend’s Spring Messaging contract. |
| Auth (optional) | Firebase Web SDK | 12.15 | Google Sign-In popup, then exchange for a backend JWT. |
| Build / dev server | Next.js CLI | 15.5 | `next dev`, `next build`. |
| Lint | `next lint` (ESLint 9 preset) | 9.28 | Style + hook rules. |
| Formatting | TypeScript compiler (`tsc --noEmit`) | 5.8 | Type-only validation. |
| CI | GitHub Actions | — | Automated typecheck, lint, build on every PR and push to `main`. |

### 2.1 Why Next.js

Three requirements drove the choice:

1. **File-system routing.** The doctor scope is a small, fixed set of routes (`/dashboard`, `/patients`, `/patients/[patientId]`, `/chats`, `/appointments`, etc.). Next.js's App Router expresses these as directories under [src/app/](src/app), avoiding hand-written route configuration.
2. **Development-time backend rewrite proxy.** The backend deploys on an Elastic Beanstalk host that does not currently set CORS headers for a browser origin. Next.js's `rewrites()` in [next.config.ts](next.config.ts) proxies `/api/*` from the local dev origin to the backend, sidestepping CORS during development without any browser configuration.
3. **Production readiness.** Static prerendering for public routes (`/login`, `/register`), on-demand rendering for authenticated shell routes, code-splitting per route, and font/image optimisation come out of the box.

An alternative such as Vite + React Router would have required us to build the routing layer, the rewrite proxy, and font/image plumbing by hand.

### 2.2 Why React 19 + TypeScript

React was fixed by the choice of Next.js. The version was pinned to 19 to match the React runtime that Next 15 ships with. TypeScript is used across the codebase (`.ts`, `.tsx`) for two concrete reasons:

- The backend returns non-trivial JSON shapes (`HealthMetric`, `Appointment`, `NotificationItem`, paged responses). Modelling those once in [src/types/models.ts](src/types/models.ts) lets every consumer benefit from autocomplete and compile-time checking.
- The API layer [src/services/apiClient.ts](src/services/apiClient.ts) uses generics (`rawRequest<T>`) so that endpoint response shapes flow into the calling component without runtime casts.

### 2.3 Why Tailwind CSS

The design specification in [web-rebuild-context/DESIGN_SYSTEM.md] defines the NABDA palette as concrete tokens (`primary #407BFF`, `secondary #00B4D8`, `dark blue #03045E`, etc.). Tailwind allows those tokens to be expressed once in [tailwind.config.ts](tailwind.config.ts) and consumed as utility classes (`text-primary`, `bg-darkBlue`) throughout the component tree. This keeps the design token definition in one place and prevents the drift that hand-written CSS classes tend to accumulate.

### 2.4 Why STOMP over SockJS

The backend exposes its realtime endpoints as a Spring `WebSocketMessageBroker` using STOMP frames, with SockJS transport fallback. Any client wishing to receive `/user/queue/messages`, `/user/queue/chat-status`, `/user/queue/system`, or `/topic/vitals/{doctorId}` must speak the same protocol. `@stomp/stompjs` + `sockjs-client` is the direct browser equivalent of the Java client used by the mobile app.

### 2.5 Why Firebase for Google Sign-In only

The backend does not implement OAuth. To support the "Continue with Google" experience the mobile app already offers, this app follows the same pattern:

1. Firebase Web SDK ([src/services/firebaseAuth.ts](src/services/firebaseAuth.ts)) opens the Google consent popup and returns a verified Firebase UID and email.
2. The app then performs a regular backend login using the deterministic password `GoogleAuth_{firebaseUid}` — a contract established by the mobile app and re-used verbatim so the same backend accounts continue to work.

No user data lives in Firebase; it is only used as a Google identity broker.

---

## 3. High-level architecture

```
                ┌──────────────────────────────────────────────────────┐
                │                     Browser                          │
                │                                                      │
                │   ┌────────────────────────────────────────────────┐ │
                │   │              React / Next App                  │ │
                │   │                                                │ │
   Firebase ◄───┼───┤   Firebase Auth SDK (popup only)               │ │
   Google       │   │                                                │ │
                │   │   AuthContext ──► apiClient (REST)             │ │
                │   │      │            │                            │ │
                │   │      │            ▼                            │ │
                │   │      │        /api/* rewrite ──► Backend REST  │ │
                │   │      │                                         │ │
                │   │      └────► realtime (STOMP/SockJS) ──► Backend│ │
                │   │                       WS                        │ │
                │   └────────────────────────────────────────────────┘ │
                └──────────────────────────────────────────────────────┘
```

The Next dev server owns the `/api/*` rewrite; in production, either the same rewrite or a reverse proxy in front of the app serves the same purpose. Only two external endpoints are hit from the browser directly: the backend WebSocket and Firebase Auth's Google popup.

---

## 4. Directory structure

```
src/
├── app/                    App Router pages
│   ├── layout.tsx          Root layout, provider composition, metadata / favicons
│   ├── login/              Login (email + password + Google)
│   ├── register/           Doctor self-registration
│   ├── dashboard/          KPI cards, alerts, recent patients
│   ├── patients/           Patient list
│   │   └── [patientId]/    Detail, vitals, reports (dynamic route)
│   ├── chats/              Conversation list
│   │   └── [patientId]/    Active chat with a specific patient
│   ├── appointments/       Schedule + status management
│   ├── notifications/      Paginated notification centre
│   ├── profile/            Doctor profile edit
│   └── settings/           Local UI preferences
├── components/
│   ├── layout/             ProtectedShell, ConnectivityGate
│   ├── dashboard/          StatCard, AlertCard
│   ├── patients/           PatientCard
│   ├── chat/               MessageBubble, ChatTile
│   ├── vitals/             VitalCard (with ECG painter), VitalChart (with tooltips)
│   ├── notifications/      NotificationTile
│   ├── appointments/       AppointmentCard
│   └── ui/                 Reusable primitives: Button, Card, Input, Modal, Icon...
├── context/
│   ├── AuthContext.tsx     Session state, login/logout, force-logout handler
│   ├── ThemeContext.tsx    Dark/light mode
│   └── ToastContext.tsx    Global toast queue
├── services/
│   ├── apiClient.ts        Centralised REST client + typed endpoints
│   ├── websocket.ts        STOMP client + typed subscription helpers
│   ├── firebaseAuth.ts     Google Sign-In popup adapter
│   ├── storage.ts          JWT / credentials / settings persistence
│   └── connectivity.ts     Offline & backend-reachability hook
├── types/models.ts         Domain models mirroring the backend DTOs
└── utils/                  clsx, date, format helpers
```

Every REST call is issued through [src/services/apiClient.ts](src/services/apiClient.ts). Every socket message is emitted through [src/services/websocket.ts](src/services/websocket.ts). No fetch/subscribe calls exist elsewhere in the tree. This is a deliberate choice that keeps auth, retry, and error normalisation in one file rather than scattered across components.

---

## 5. Key subsystems

### 5.1 Authentication and session lifecycle

Files: [src/context/AuthContext.tsx](src/context/AuthContext.tsx), [src/services/apiClient.ts](src/services/apiClient.ts), [src/services/storage.ts](src/services/storage.ts), [src/services/firebaseAuth.ts](src/services/firebaseAuth.ts).

1. The user submits credentials on `/login`. `AuthContext.login()` calls `POST /auth/login`, receives a JWT, and stores it in `localStorage`.
2. It then calls `GET /user/me`. The response `role` must be `DOCTOR`; any other role triggers a doctor-only error toast, storage cleanup, and a redirect back to `/login`. This is the doctor-only guard the scope requires.
3. `AuthContext` connects the STOMP client (`realtime.connect(userId, heartbeat)`), which subscribes to the four topics the doctor cares about, and starts a 30-second `PUT /presence/heartbeat/{userId}` interval.
4. On every subsequent REST call, `apiClient` attaches `Authorization: Bearer <jwt>`. When the backend returns 401/403 on a protected call, `apiClient` invokes `refreshToken()`. The current implementation re-logs in with credentials stored in `sessionStorage`; a real refresh-token endpoint would be preferable and is called out in the report’s future-work section.
5. On logout (or force-logout after a failed refresh), the STOMP client is torn down, storage is cleared, and the user is redirected to `/login`.

### 5.2 Route protection

Files: [src/components/layout/ProtectedShell.tsx](src/components/layout/ProtectedShell.tsx).

Every authenticated page wraps its content in `<ProtectedShell>`. The shell reads `useAuth()`; if the session is loading, it renders a spinner; if there is no user, it redirects to `/login`. The shell also owns the persistent sidebar (desktop), the mobile bottom navigation, the header, the theme toggle, and the logout confirmation modal.

Placing the guard in the shell (rather than in Next.js middleware) keeps the guard on the client, which is sufficient because all sensitive data is fetched through authenticated REST calls that will themselves 401 without a valid JWT.

### 5.3 Realtime layer

Files: [src/services/websocket.ts](src/services/websocket.ts).

`RealtimeClient` is a single-instance service. On `connect(userId, heartbeat)` it:

- Opens a SockJS transport to `/ws` on the backend host.
- Sends the JWT in the STOMP `connect` frame headers.
- Subscribes to:
  - `/user/queue/messages` — chat messages.
  - `/user/queue/chat-status` — read / delivered receipts.
  - `/user/queue/system` — server-issued system events (payload schema still to be typed against the backend contract).
  - `/topic/vitals/{doctorId}` — live vital-sign broadcasts for patients assigned to this doctor.
- Exposes three subscription helpers (`onMessage`, `onVitals`, `onStatus`) that return a `void`-returning unsubscribe closure so React `useEffect` destructors can be written cleanly.

Pages that need live data (dashboard, patients list, patient detail, vitals) subscribe via `onVitals` and merge incoming metrics into local state keyed by `patientId`.

### 5.4 Data / API layer

Files: [src/services/apiClient.ts](src/services/apiClient.ts), [src/types/models.ts](src/types/models.ts).

`apiClient` is a plain object of typed methods (one per documented endpoint). Each method calls a generic `rawRequest<T>` that:

- Attaches `Authorization` when `auth !== false`.
- Serialises JSON bodies and sets `Content-Type` / `Accept` headers.
- Distinguishes network errors (`TypeError` → "Cannot reach backend") from HTTP errors.
- Triggers `refreshToken()` on 401/403 and retries once.
- Parses server error bodies into human-readable messages.

Response quirks that arise from the backend’s partial standardisation are normalised at the boundary: `HealthMetric.critical`/`timestamp` aliases, notification `read`/`isRead` aliases, appointment ISO strings missing the trailing `Z`, and paged-or-array notification responses. Components downstream see a single canonical shape defined in `types/models.ts`.

### 5.5 Connectivity gate

Files: [src/services/connectivity.ts](src/services/connectivity.ts), [src/components/layout/ConnectivityGate.tsx](src/components/layout/ConnectivityGate.tsx).

The `useConnectivity()` hook watches:

- `navigator.onLine` — immediately reports "offline" if the browser reports no network.
- `online` / `offline` / `focus` window events — for reactive updates.
- A 30-second poll of `GET /user/me` — distinguishes "browser online but backend unreachable" from "everything fine".

When status is not `"online"`, `ProtectedShell` overlays a full-page `ConnectivityGate` with a message ("You are offline" / "Cannot reach the server") and a **Retry now** button that triggers an immediate re-probe. This closes a documented UX gap where the app would previously fail silently on transient backend outages.

### 5.6 State management

The application deliberately avoids a global state library (Redux, Zustand, Jotai). Reasoning:

- Authentication state is genuinely global and lives in one React context (`AuthContext`).
- Theme and toast state are also global and use their own contexts.
- Everything else — patient lists, vitals, chats, appointments, notifications — is *per-page* state derived from REST calls plus subscription updates. `useState` + `useEffect` are sufficient. Introducing a global store would add ceremony without measurable benefit for a codebase of this size.

### 5.7 Styling and design tokens

Files: [tailwind.config.ts](tailwind.config.ts), [src/app/globals.css](src/app/globals.css).

The NABDA colour palette, radii, and shadow tokens are defined once in the Tailwind config and consumed as utility classes across components. Dark mode is class-based (`html.dark`), toggled by `ThemeContext` and persisted in `localStorage`. Two custom fonts (Roboto, Cairo) are loaded from Google Fonts for language parity with the mobile app, and Material Symbols Rounded is loaded for icon parity.

---

## 6. End-to-end flow examples

### 6.1 Doctor login (email + password)

```
LoginPage.onSubmit
  → AuthContext.login({email,password})
    → apiClient.login()           POST /api/auth/login          (JWT)
    → storage.setToken(jwt)
    → storage.setCredentials(...)
    → apiClient.me()              GET  /api/user/me             (User)
    → role check → applyDoctor()
      → storage.setUser(profile)
      → realtime.connect(id, heartbeat)
        → SockJS + STOMP CONNECT (Authorization: Bearer <jwt>)
        → subscribe /user/queue/messages, /user/queue/chat-status,
                    /user/queue/system, /topic/vitals/{id}
        → schedule heartbeat every 30 s
    → router.replace('/dashboard')
```

### 6.2 Viewing a patient's live vitals

```
PatientVitalsPage effect (mount)
  → apiClient.latestMetric(id)    GET /api/iot/latest/{id}
  → apiClient.hourlySummary(id,24) GET /api/iot/summary/hourly/{id}
  → render VitalCard + VitalChart

PatientVitalsPage effect (realtime)
  → realtime.onVitals(metric =>
      if metric.patientId === id: setLatest(metric))
```

Incoming STOMP messages on `/topic/vitals/{doctorId}` update the "latest" panel without any manual polling.

### 6.3 Sending a chat message

```
ActiveChatPage.send
  → optimistic push to local state
  → realtime.sendChat(message)   STOMP SEND /app/chat.send
                                  server broadcasts to /user/queue/messages
                                  → onMessage handler appends echo (if any)
                                  → sender sees delivered/read receipt
```

---

## 7. Non-functional properties

### 7.1 Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every PR. Concurrency cancels superseded runs. The workflow performs three checks:

1. `npm ci` — reproducible install from `package-lock.json`.
2. `npm run typecheck` — strict `tsc --noEmit`.
3. `npm run lint` — Next lint (ESLint 9 preset).
4. `npm run build` — production build to verify no run-time regressions in server-render paths.

`BACKEND_API_URL` is stubbed in CI so the build cannot accidentally embed the real backend URL.

### 7.2 Error handling and resilience

- All fetch calls flow through `apiClient`, which converts network failures into a domain `ApiError` with a stable message the UI can display in a toast.
- The realtime client reconnects automatically after transient disconnects (`reconnectDelay: 5000`).
- The connectivity gate provides an explicit UX surface for offline / backend-unreachable states.
- 401/403 on any protected call triggers an automatic silent re-login; a failed re-login triggers `forceLogout()`, which shows a "session expired" toast and returns the user to `/login`.

### 7.3 Security posture

- JWT is stored in `localStorage`; XSS mitigation depends on React's escaping and CSP (production only).
- Interim doctor credentials are stored in `sessionStorage` to support the auto re-login pattern. A refresh-token endpoint would replace this and is documented as a follow-up.
- Backend host currently exposes plain HTTP; production deployment requires TLS termination and a CORS policy naming the web origin. This is a backend/infra concern rather than an application concern.
- Firebase configuration variables use the `NEXT_PUBLIC_` prefix and are, by design, safe to ship in the browser bundle.

### 7.4 Accessibility

- Every form field has an associated `<label>`.
- Error messages carry `role="alert"` (see [src/components/ui/Input.tsx](src/components/ui/Input.tsx)).
- The toast region is `aria-live="polite"` and toasts of type `error`/`warning` promote to `role="alert"`.
- The connectivity gate is `role="alert"` with `aria-live="assertive"` because it blocks the entire UI.
- Interactive icons carry `aria-label`s.

### 7.5 Progressive Web App

`public/manifest.json` and the icon set in `public/favicons/` (16, 32, 48, 96, 192, 256, 512 px, with maskable variants) allow the app to be installed on a supported browser. `src/app/favicon.ico` is packed from the 16/32/48 PNGs so classic favicon consumers also see a crisp icon.

---

## 8. Deliberate simplifications

Design choices that could look under-engineered but are intentional:

- **No global state library.** All non-auth state is local to the page. See §5.6.
- **No test suite yet.** Type-checking and `next build` catch the majority of regressions at compile time; CI enforces both. Runtime testing was performed manually against the live backend during development.
- **No per-frame Canvas painters on `VitalCard`.** The mobile app draws animated per-icon backgrounds (ECG line, bubbles, wave fill, pulsing rings). The design specification explicitly permits skipping these on web for performance; we implement the ECG heartbeat SVG (the "one painter worth a stretch goal") and omit the rest.
- **No `/user/queue/system` typed dispatcher yet.** Backend has not documented the payload schemas for those events. A discriminated union will be added once the payloads are known; a scaffold exists in `realtime.onStatus`.

---

## 9. Future work

- Real refresh-token endpoint to eliminate stored credentials.
- Typed `/user/queue/system` dispatcher.
- Clinical thresholds and warning states for SpO2 (needs product / firmware input).
- Automated integration tests exercising the REST + STOMP contract against a staging backend.
- Full HTTPS + CORS on the backend for production deployment.

---

*This document reflects the state of the repository at the time of writing. All references to files, endpoints, and behaviours can be verified by inspecting the paths cited above.*
