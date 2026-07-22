# NABDA Doctor Web 🩺✨

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![WebSockets](https://img.shields.io/badge/WebSockets-STOMP-orange?style=for-the-badge&logo=websocket)](https://stomp.github.io/)

> **Your Health, Your Pulse** — A premium, desktop-responsive web interface designed exclusively for medical professionals.

NABDA Doctor Web is a connected healthcare follow-up and diagnostic support system optimized for **cardiovascular monitoring**. Rebuilt from the ground up utilizing the core design system and logic of the NABDA ecosystem, this browser-native web application enables doctors to monitor real-time vitals, manage patient assignments, communicate via real-time chats, schedule appointments, and review AI-assisted cardiac evaluation histories.

---

## 🚀 Key Features

*   **🏥 Clinical Dashboard:** Visual center providing instantaneous feedback on active assignments, critical cases, today's appointments, missed schedules, and unread patient chat count.
*   **👥 Patient Directory:** Full management portal allowing medical staff to view assigned cases, search/filter patient directories client-side, assign new patients by phone/name, and remove inactive assignments.
*   **📊 Live Vitals Stream:** Real-time visual tracking of Heart Rate (BPM) and Oxygen Saturation ($SpO_2$) streamed directly from companion IoT wearables via STOMP WebSockets.
*   **💬 Real-Time Chats:** Direct 1-to-1 encrypted doctor-patient chats featuring message delivery/read confirmations, online status flags, and historical conversation loading.
*   **📅 Appointment Manager:** Four-tab calendar interface separating Upcoming, Completed, Missed, and Cancelled consultations. Includes status transition mechanics (e.g., scheduling, cancellation) built directly into patient views.
*   **🛡️ AI Cardiac Reports:** Full list and details of AI-generated cardiac assessment histories, providing supplementary assistance for clinical decision-making.
*   **🔔 Notifications Hub:** Real-time push alert system with list-based paging and global "Mark All as Read" capabilities.
*   **⚙️ Doctor Profile & Configuration:** Secure panel to update account credentials, toggle notification permissions, change interface language, and upload custom avatars (base64 data URIs).

---

## ⚠️ Medical Safety Disclaimer

> [!IMPORTANT]
> **AI reports and automated cardiac assessments generated within the NABDA ecosystem are advisory only.** All calculations, warnings, and alerts must be reviewed by qualified medical professionals. This software is not a substitute for professional clinical judgment, diagnosis, or treatment.

---

## 🛠️ Architecture & Codebase Map

The frontend architecture is optimized for performance, modularity, and responsiveness:

*   **API Service Layer ([src/services/apiClient.ts](file:///e:/side projects/GP/gp-web-app/src/services/apiClient.ts)):** Centralized, typed Axios-equivalent client wrapping all REST endpoints, handling bearer token headers, credentials refresh, and standardizing response payloads.
*   **WebSocket Engine ([src/services/websocket.ts](file:///e:/side projects/GP/gp-web-app/src/services/websocket.ts)):** Implements the STOMP protocol over SockJS, connecting to backend message brokers for chat, vitals metrics, and system alert updates.
*   **Auth Manager ([src/services/firebaseAuth.ts](file:///e:/side projects/GP/gp-web-app/src/services/firebaseAuth.ts)):** Connects with Firebase Google Sign-In and bridges Firebase identity with JWT-based backend credentials.
*   **Protected Shell ([src/components/layout/ProtectedShell.tsx](file:///e:/side projects/GP/gp-web-app/src/components/layout/ProtectedShell.tsx)):** Enforces doctor authentication, auto-relogin triggers, routing guards, and global confirmation prompts (e.g., logouts).
*   **Connectivity Gate ([src/components/layout/ConnectivityGate.tsx](file:///e:/side projects/GP/gp-web-app/src/components/layout/ConnectivityGate.tsx)):** Monitors client-side connectivity (`navigator.onLine`) and runs periodic endpoint health probes to display interactive recovery interfaces during outages.

---

## 🎨 Design & Aesthetic Identity

The visual language follows the established NABDA design rules:
*   **Primary Palette:** Primary Blue (`#407BFF`), Secondary Cyan (`#00B4D8`), Deep Blue (`#03045E`), Accent Teal (`#00BFA5`), and Error Crimson (`#E53935`).
*   **Primary Gradient:** Top-Left to Bottom-Right gradient (`#407BFF` ➡️ `#00B4D8`) used on branding highlights and headers.
*   **Typography:** Google Fonts' `Roboto` (Latin text) paired with `Cairo` (Arabic & RTL layouts) for dynamic bilingual support.
*   **Icons:** Material Symbols Rounded for clean visual alignment.

---

## 💻 Local Development Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18.x or newer recommended)
*   [npm](https://www.npmjs.com/) (packaged with Node.js)

### Step 1: Install Dependencies
Clone the repository, navigate to the project directory, and install the package dependencies listed in [package.json](file:///e:/side projects/GP/gp-web-app/package.json):
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the template file [.env.example](file:///e:/side projects/GP/gp-web-app/.env.example) to create your local config file:
```bash
cp .env.example .env.local
```
Open `.env.local` and specify your backend URLs and Firebase config variables:
```env
NEXT_PUBLIC_API_URL=/api
BACKEND_API_URL=http://localhost:8080/api
NEXT_PUBLIC_WS_HOST=localhost:8080

# Firebase Config (Google Sign-In integration)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
```

> [!NOTE]
> The setting `NEXT_PUBLIC_API_URL=/api` instructs the browser to send API requests to the local Next.js server. Next.js then proxies these requests to `BACKEND_API_URL` under the hood via the rewrites configured in [next.config.ts](file:///e:/side projects/GP/gp-web-app/next.config.ts), avoiding local development CORS blocks.

### Step 3: Run the Development Server
Launch the development environment:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the application.

---

## 🧪 Verification & Linting

Before pushing code changes to production or submitting pull requests, run these quality check commands to ensure clean code:

```bash
# Type check all TypeScript files
npm run typecheck

# Run ESLint validation
npm run lint

# Compile and build the production bundle
npm run build
```

These three validation scripts are executed automatically as part of the integration pipeline on every PR and main-branch check-in — see [.github/workflows/ci.yml](file:///e:/side projects/GP/gp-web-app/.github/workflows/ci.yml).

---

## 👥 Graduation Project Team & Credits

This project was built as part of the Graduation Project curriculum at **Alexandria University**, Faculty of Engineering, Communication & Electronics Department.
*   **Supervisor:** Dr. Aida El-Shafie
