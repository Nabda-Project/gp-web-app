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

The same three commands run in GitHub Actions on every push to `main` and on every PR — see [.github/workflows/ci.yml](.github/workflows/ci.yml).

## Connectivity

Every protected page mounts a connectivity gate ([src/services/connectivity.ts](src/services/connectivity.ts), [src/components/layout/ConnectivityGate.tsx](src/components/layout/ConnectivityGate.tsx)). It watches `navigator.onLine`, and polls `GET /user/me` every 30 s (and on window focus / `online` events). If the browser goes offline or the backend probe fails with a network error, a full-screen overlay blocks the UI until connectivity is restored or the doctor clicks **Retry now**.

## Favicons

The full favicon set is generated from `public/brand/app-logo.png` at 16/32/48/96/192/256/512 px into `public/favicons/`, and packed into `src/app/favicon.ico`. To regenerate after the logo changes:

```bash
node -e "const s=require('sharp');[16,32,48,96,192,256,512].forEach(x=>s('public/brand/app-logo.png').resize(x,x,{fit:'contain',background:{r:0,g:0,b:0,alpha:0}}).png().toFile('public/favicons/icon-'+x+'.png'))"
```

Then rebuild the `.ico` and reference the new sizes in [layout.tsx](src/app/layout.tsx) and [public/manifest.json](public/manifest.json) if you add/remove sizes.

## TODO / Missing Info From Source Docs

- Backend HTTPS and CORS must be verified before production deployment.
- The web refresh-token strategy still follows the documented mobile re-login behavior; a real refresh-token endpoint would be safer.
- Full WebSocket system-event payload schemas are not documented, so system events are parsed generically.
- Real SpO2 semantics need backend/firmware confirmation before clinical use.
