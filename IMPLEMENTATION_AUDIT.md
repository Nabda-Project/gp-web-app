# IMPLEMENTATION_AUDIT.md

## Audit scope

Audited the implemented Next.js doctor web app against:

- `web-rebuild-context/DOCTOR_WEB_BUILD_BRIEF.md`
- `web-rebuild-context/DOCTOR_WEB_SCOPE.md`
- `web-rebuild-context/API_MAP.md`
- `web-rebuild-context/AUTH_AND_SESSION.md`
- `web-rebuild-context/DATA_MODELS.md`
- `web-rebuild-context/DESIGN_SYSTEM.md`
- `web-rebuild-context/COMPONENT_INVENTORY.md`
- `web-rebuild-context/ASSET_MANIFEST.md`

## Passed checks

### Scope

- Doctor-only route set is implemented: `/login`, `/register`, `/dashboard`, `/patients`, `/patients/[patientId]`, `/patients/[patientId]/vitals`, `/patients/[patientId]/reports`, `/patients/[patientId]/chat` alias, `/chats`, `/chats/[patientId]`, `/appointments`, `/notifications`, `/profile`, and `/settings`.
- No patient-only pages were implemented.
- Patient data appears only in documented doctor workflows: patient list/detail, vitals, reports, chat, appointments, and notifications.

### API correctness

- API calls are centralized in `src/services/apiClient.ts`.
- Implemented endpoints match `API_MAP.md` and use documented HTTP methods:
  - Auth: `POST /auth/login`, `POST /auth/register`, `GET /user/me`, `PUT /user/me`.
  - Doctor patients: `GET /doctor/patients/{doctorId}`, `GET /doctor/search/name`, `GET /doctor/search/phone`, `POST /doctor/assign`, `DELETE /doctor/remove`.
  - IoT doctor reads: `GET /iot/latest/{patientId}`, `GET /iot/summary/{patientId}`, `GET /iot/summary/hourly/{patientId}`.
  - Chat: `GET /chat/conversations/{userId}`, `GET /chat/history/{userId1}/{userId2}`, `PUT /chat/read/{senderId}/{receiverId}`, `PUT /chat/deliver/{senderId}/{receiverId}`.
  - Presence: `GET /presence/{userId}`, `PUT /presence/heartbeat/{userId}`.
  - Appointments: `GET /appointments/doctor/{doctorId}`, `POST /appointments/schedule`, `PATCH /appointments/{appointmentId}/status`.
  - Notifications: documented read/delete/count/chat/appointment endpoints.
  - AI doctor view: `GET /ai/history/{patientId}`.
- No patient-only REST endpoints are called (`/patient/doctor`, `/appointments/patient/{id}/next`, `/iot/upload`, `/ai/consult`, `/ai/my-reports` are absent).
- Auth header is `Authorization: Bearer <JWT>` for protected requests.
- Response quirks are handled: empty responses, health metric `critical`/`timestamp` aliases, notification `read` aliases, appointment datetimes without `Z`, and paginated-or-array notification response shape.

### Auth correctness

- Login uses backend JWT only, then loads `/user/me`.
- Register hardcodes `role: "DOCTOR"` and omits patient-only height/weight fields.
- Patient-role login is blocked with doctor-only error messaging and session cleanup.
- Protected shell redirects unauthenticated users to `/login`.
- Logout clears JWT, credentials, user state, and disconnects realtime.
- 401/403 on protected API calls attempts documented credential re-login and retries the original request.
- Failed refresh triggers force logout with the documented session-expired toast.

### Design correctness

- Core CSS tokens match documented NABDA palette: primary `#407BFF`, secondary `#00B4D8`, dark blue `#03045E`, background `#F8FAFC`, grey `#94A3B8`, light grey `#E2E8F0`, teal `#00BFA5`, error `#E53935`.
- Roboto and Cairo are loaded from Google Fonts; Material Symbols Rounded is loaded for Material icon parity.
- Required assets from `ASSET_MANIFEST.md` are copied to `public/brand`.
- Layout is browser-native: persistent sidebar on desktop, mobile bottom nav, dashboard grids, split/card layouts, modal dialogs instead of mobile bottom sheets.
- Reusable components exist for documented primitives: buttons, inputs, avatar, badge, modal, skeletons, patient cards, stat cards, alert cards, vital cards, chat tiles/bubbles, appointments, notifications, and protected shell.

### UX states

- Loading states exist for dashboard, patients, vitals, chats, appointments, notifications, and reports.
- Empty states exist for patients, chats, notifications, appointments, vitals chart data, reports, and missing patient detail.
- Error states exist for dashboard/patient list/vitals/reports/appointments.
- Disabled/loading button states exist for form submission, assignment, scheduling, and notification pagination.
- Login/register validation follows documented strings and formats.
- Appointment scheduling blocks past date/time.
- Assign-patient search uses documented 2-character minimum and 500 ms debounce.

### Code quality

- TypeScript data models are centralized in `src/types/models.ts`.
- API calls are centralized in `src/services/apiClient.ts`.
- Session storage is centralized in `src/services/storage.ts`.
- WebSocket/STOMP is centralized in `src/services/websocket.ts`.
- No hardcoded secrets exist; base URLs are configurable through `.env.example`.
- `README.md` exists with setup, checks, and source-doc TODOs.

## Failed checks found and fixed

1. Dashboard critical alert counted all "need attention" patients, including `MEDIUM`.
   - Fixed: `src/app/dashboard/page.tsx` now uses only `CRITICAL` and `HIGH` for the critical alert banner.

2. Live vitals WebSocket data was subscribed globally but not reflected in visible patient/vitals screens.
   - Fixed:
     - `src/app/dashboard/page.tsx`
     - `src/app/patients/page.tsx`
     - `src/app/patients/[patientId]/page.tsx`
     - `src/app/patients/[patientId]/vitals/page.tsx`
   - These pages now listen to `/topic/vitals/{doctorId}` updates through `realtime.onVitals`.

3. Chat history load did not mark undelivered messages from the patient as delivered.
   - Fixed: `src/app/chats/[patientId]/page.tsx` now calls `PUT /chat/deliver/{patientId}/{doctorId}` for undelivered patient messages loaded from history.

4. Notification center loaded only the first page.
   - Fixed: `src/app/notifications/page.tsx` now tracks `page`/`hasMore` and loads additional pages using the documented `page`/`size` query params.

5. `/login` and `/register` did not redirect an already-authenticated doctor.
   - Fixed:
     - `src/app/login/page.tsx`
     - `src/app/register/page.tsx`

6. Profile email/password changes did not update stored credentials used by the documented auto re-login behavior.
   - Fixed: `src/app/profile/page.tsx` updates session credentials after profile save when credentials are available.

7. Logout actions did not ask for confirmation.
   - Fixed:
     - `src/components/layout/ProtectedShell.tsx`
     - `src/app/profile/page.tsx`

8. Realtime unsubscribe functions returned booleans instead of `void`, causing React effect destructor type errors after vitals wiring.
   - Fixed: `src/services/websocket.ts`.

## Missing items / remaining gaps

These are documented gaps or lower-level parity items that remain:

1. Full visual parity for several mobile delight animations is partial.
   - Remaining: painted VitalCard backgrounds, chart tooltip/fit-to-screen behavior, and animated StatusCard painter effects.
   - Exact fix: port the documented painters in `COMPONENT_INVENTORY.md`/`DESIGN_SYSTEM.md` to CSS/SVG and add chart tooltip interaction.

2. Notification pagination is explicit "Load more" instead of automatic infinite-scroll.
   - Exact fix: add an intersection observer sentinel at the end of the list and call the same `load(page + 1, true)` logic automatically.

3. Server-down and no-internet full-page gates are not implemented.
   - Exact fix: add connectivity/server reachability state to the protected app shell using `navigator.onLine` plus the documented base URL health check behavior.

4. WebSocket system-event payload schemas are undocumented.
   - Exact fix: after backend schema confirmation, route `/user/queue/system` events to patient, appointment, and notification state refreshes with typed payloads.

5. Favicons are copied from available source/reference assets, but a complete generated 16/32/48/96/192/256/512 favicon set is not produced in-repo.
   - Exact fix: generate documented favicon sizes from `public/brand/app-logo.png` and update `public/manifest.json`.

6. Google Sign-In is intentionally omitted for v1 because the docs say web OAuth needs backend/team clarification.
   - Exact fix: implement only after a documented backend endpoint or Firebase web strategy exists.

## Files changed during audit fixes

- `src/app/login/page.tsx`
- `src/app/register/page.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/patients/page.tsx`
- `src/app/patients/[patientId]/page.tsx`
- `src/app/patients/[patientId]/vitals/page.tsx`
- `src/app/chats/[patientId]/page.tsx`
- `src/app/notifications/page.tsx`
- `src/app/profile/page.tsx`
- `src/components/layout/ProtectedShell.tsx`
- `src/services/websocket.ts`

## Verification

- `npm run typecheck`: pass after fixes.
- `npm run lint`: pass after fixes.
- `npm run build`: pass after fixes.
