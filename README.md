# Farm Tracker

A web application for tracking farm production — greenhouses, garden, crop growing, harvesting, sales, and statistics. Single-user application built for one user.

## Features

- **Growing** — track plantings by plot (greenhouses, garden)
- **Harvest** — log harvested produce, broken down by quality
- **Sales** — track sold produce, with running stock/inventory
- **Statistics** — summary metrics: harvested vs sold by crop, yield by plot, revenue by period
- **Authentication** — email/password login (Firebase Auth)

## Tech Stack

- **React 19** + **TypeScript** — frontend
- **Vite** — build tool and dev server
- **Tailwind CSS v4** — styling
- **shadcn/ui** (Radix UI) — UI components
- **React Hook Form** + **Zod** — forms and validation
- **Firebase**
  - **Firestore** — database
  - **Authentication** — login (Email/Password)

## Requirements

- Node.js 18+ and npm
- A Firebase project with Firestore and Authentication configured

## Local Setup

1. Clone the repository:

```bash
git clone https://github.com/Flavyws/newrepo.git
cd newrepo
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the project root with your Firebase config (Project Settings → General → SDK setup and configuration):

VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id


`.env.local` is not committed to git (see `.gitignore`).

4. Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

## Firebase Setup

In the [Firebase Console](https://console.firebase.google.com):

1. **Authentication** → Sign-in method → enable **Email/Password**
2. **Authentication** → Users → add a user manually (email + password) — there's no in-app sign-up, the account is created directly in the console
3. **Firestore Database** → create a database (production mode), configure Security Rules as needed

## Build

```bash
npm run build
```

Build output goes to the `dist/` folder. To preview the build locally:

```bash
npm run preview
```

## Deployment — Firebase Hosting

1. Install Firebase CLI (if not already installed):

```bash
npm install -g firebase-tools
```

2. Log in:

```bash
firebase login
```

3. Initialize hosting in the project (one-time setup):

```bash
firebase init hosting
```
When prompted:
- Public directory: `dist`
- Configure as a single-page app: **Yes**
- Set up automatic builds with GitHub: optional

4. Build and deploy:

```bash
npm run build
firebase deploy --only hosting
```

## Git Workflow

```bash
git add .
git commit -m "Describe your changes"
git push origin main
```

## Project Structure

src/
├── firebase/ # Firebase config and initialization
├── hooks/ # custom hooks (useAuth, useHarvests, etc.)
├── lib/ # utilities, helper logic
├── components/
│ ├── ui/ # shadcn components
│ ├── plantings/ # growing-related components
│ ├── harvests/ # harvest-related components
│ ├── sales/ # sales-related components
│ └── stats/ # statistics components
├── pages/ # app screens
└── App.tsx # root component