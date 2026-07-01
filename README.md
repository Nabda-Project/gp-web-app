# NABDA Doctor Web

Doctor-only browser web app rebuilt from the extracted Flutter context in `web-rebuild-context`.

## Scope

- Doctor login/register, protected doctor routes, dashboard, patients, patient detail, vitals, AI report history, chats, appointments, notifications, profile, and settings.
- Patient-only pages and patient-only endpoints are intentionally excluded.
- API calls are centralized in `src/services/apiClient.ts` and match `API_MAP.md`.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Default API configuration:

```env
NEXT_PUBLIC_API_URL=/api
BACKEND_API_URL=http://smart-medical-api-env.eba-jxdmccmi.us-east-1.elasticbeanstalk.com/api
NEXT_PUBLIC_WS_HOST=smart-medical-api-env.eba-jxdmccmi.us-east-1.elasticbeanstalk.com
```

`NEXT_PUBLIC_API_URL=/api` makes the browser call the local Next.js app first. Next.js then proxies those requests to `BACKEND_API_URL`, which avoids browser CORS failures from the Elastic Beanstalk backend during local development.

For Google Sign-In, create a Firebase Web app in the same Firebase project used by the mobile app and fill these in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
```

The Google flow mirrors the mobile app: Firebase Google Auth provides the UID, then the backend login uses the deterministic password `GoogleAuth_{firebaseUid}`. New Google doctors are asked for phone, date of birth, and gender before the app calls the documented `/auth/register` endpoint with `role: "DOCTOR"`.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```

## TODO / Missing Info From Source Docs

- Backend HTTPS and CORS must be verified before production deployment.
- The web refresh-token strategy still follows the documented mobile re-login behavior; a real refresh-token endpoint would be safer.
- Full WebSocket system-event payload schemas are not documented, so system events are parsed generically.
- Real SpO2 semantics need backend/firmware confirmation before clinical use.
