## Expensify Zen

Expensify Zen is a minimal, calming expense tracker. It lets you quickly log expenses, see them in a clean two‑column layout (name and amount), and view your total spent. Authentication is handled via Firebase (Google and GitHub), and data is stored in Firebase.

### Features

- **Expense list**: Clean two‑column display of name and amount
- **Total spent**: Automatic aggregation of all logged expenses
- **Social auth**: Sign in with Google or GitHub via Firebase Authentication
- **Modern UI**: Tailwind CSS + shadcn/ui with a soft violet theme

### Tech Stack

- **Framework**: Next.js (App Router) + TypeScript
- **UI**: Tailwind CSS, shadcn/ui
- **Auth & Data**: Firebase (Authentication, Firestore)

---

## Getting Started

### 1) Prerequisites

- Node.js 18+ (LTS recommended)
- A Firebase project (with a Web App created)

### 2) Environment variables

Create a `.env.local` file in the project root and add the following variables:

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Optional if you enable these Firebase services
# NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
# NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
```

Where to find these values:

- In Firebase Console → Project settings → Your apps → Web app → SDK setup and configuration.
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` should typically look like `<project-id>.firebaseapp.com` (or your custom Firebase Hosting domain).

### 3) Install and run

```bash
npm install
npm run dev
```

App runs at `http://localhost:3000`.

---

## Firebase Setup

1. In Firebase Console → Authentication → Sign-in method:
   - Enable **Google** and **GitHub** providers.
2. In Authentication → Settings → Authorized domains:
   - Add your local and deployed domains, e.g. `localhost`, `khorcha-khata.vercel.app`.
3. Copy the Web App config values (API key, auth domain, project ID, app ID) into `.env.local` (and your Vercel env for production).
4. If using GitHub auth, set the callback URL in your GitHub OAuth App to the value shown by Firebase (usually `https://<your-auth-domain>/__/auth/handler`).

---

## Deployment (Vercel)

1. Add the same environment variables in your Vercel Project Settings → Environment Variables.
2. Redeploy the app after any env or provider changes.
3. Ensure your Vercel domain(s) are added to Firebase Authorized domains.

---

## Troubleshooting

- **auth/unauthorized-domain**: Add the exact deployed domain (e.g., `khorcha-khata.vercel.app`) to Firebase → Authentication → Settings → Authorized domains. Make sure there are no typos.
- **404 on `__/auth/iframe`**: Verify `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` is your Firebase auth domain (e.g., `<project-id>.firebaseapp.com`).
