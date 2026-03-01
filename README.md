# Budget Tracker

A personal finance app built with Expo + React Native + Firebase.

The app lets each user track expenses, incomes, investments, and IOUs, then review monthly summaries, cashflow, and category-wise budget usage.

## Features

- Firebase authentication:
  - Email/password login + registration
  - Google sign-in (Expo Auth Session + Firebase credential sign-in)
- Expense tracking with category and payment method mapping
- Income tracking with income source mapping
- Investment tracking with investment type mapping
- IOU tracking:
  - Link IOUs to expenses and payment methods
  - Track `initialAmount` vs `amountLeft`
  - Mark IOUs as paid
- Config management for:
  - Expense categories
  - Payment methods
  - Income sources
  - Investment types
- Data Sources screen with segmented views for:
  - Expenses
  - Incomes
  - Investments
  - IOUs
- Monthly dashboard summary:
  - Income
  - Expense
  - Investment
  - Net savings
  - Cashflow
- Dashboard totals account for IOU recoveries
- Monthly aggregates table for recent months
- Finance screen for monthly budget vs category usage
- Filters on list screens:
  - By type/source/category/payment method
  - Amount range
  - Date range
  - Sort by date/amount

## Tech Stack

- Expo SDK 54 + React Native 0.81
- Expo Router (file-based routing)
- React Native Paper (UI)
- Firebase Auth + Firestore
- TypeScript (strict mode)

## Project Structure

```text
app/                    # Routes (tabs, detail pages, create/edit screens, auth)
components/             # Reusable UI, forms, filters, dashboard widgets
hooks/                  # Data composition + subscriptions + filtering logic
services/               # Firestore CRUD + realtime subscriptions
providers/              # App-wide providers (AuthProvider)
types/                  # Domain, firestore, and input/update types
utils/                  # Date, aggregation, lookup helpers
translations/           # Date picker translations
```

## Prerequisites

- Node.js 18+
- npm 9+
- Expo CLI (via `npx expo ...`)
- Firebase project with:
  - Authentication (Email/Password enabled)
  - Authentication (Google enabled, if using Google sign-in)
  - Cloud Firestore

## Environment Variables

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Required variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=

EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=
```

These are loaded in [`services/firebase.ts`](./services/firebase.ts).

Google auth client IDs are used in [`services/auth-service.ts`](./services/auth-service.ts).

## Getting Started

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run start
```

Run specific platforms:

```bash
npm run android
npm run ios
npm run web
```

Run lint:

```bash
npm run lint
```

## Google Sign-In Setup (Firebase)

1. In Firebase Console, enable Google provider in Authentication.
2. Create OAuth client IDs in Google Cloud Console for:
   - Web application
   - Android application (`com.th3bossc.budgettracker`)
3. Put the generated client IDs into `.env`:
   - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
   - `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

## Auth + Routing Flow

- Root route redirects to `/(tabs)/home`
- Tab layout checks auth state:
  - Unauthenticated users are redirected to `/login`
  - Authenticated users can access all tab screens
- Login supports email/password and Google sign-in
- Registration uses Firebase Auth email/password
- Auth state is provided by `AuthProvider` and persisted on native via AsyncStorage-backed Firebase auth

## Firestore Data Model

All user data is stored under:

```text
users/{uid}/
```

Subcollections used:

- `expenses`
- `incomes`
- `investments`
- `ious`
- `expenseCategories`
- `paymentMethods`
- `incomeSources`
- `investmentTypes`
- `budgets`

Notes:

- Transaction documents include `monthKey` (`YYYY-MM`) for monthly aggregation.
- Budgets are keyed by `(categoryId, monthKey)` semantics in app logic.
- IOU documents include `expenseMonthKey` and `createdMonthKey`.
- `createdAt` is set server-side with Firestore `serverTimestamp()`.

## Key Screens

- Dashboard: summary cards + recent monthly aggregates
- Data Sources: segmented list screens for Expenses, Incomes, Investments, IOUs
- Expenses / Incomes / Investments / IOUs: list, filter, delete, create, edit
- Finances: month selector + budget utilization by category
- Budget editor (`/budget/[monthKey]`): bulk budget input for categories
- Profile: logout + navigate to config masters
- OAuth redirect route: `/oauthredirect`

## Build

`eas.json` currently contains a production profile for Android APK builds.

## Scripts

From `package.json`:

- `npm run start` - Start Expo dev server
- `npm run android` - Run Android native project
- `npm run ios` - Run iOS native project
- `npm run web` - Start web build/dev server
- `npm run lint` - Run Expo lint setup

## Notes

- Currency display currently uses `₹` in UI components.
- This repo is structured for realtime updates via Firestore `onSnapshot` subscriptions.
