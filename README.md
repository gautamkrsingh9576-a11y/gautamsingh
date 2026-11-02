# E-TECH Trend Radar

AI-driven consumer-tech trend discovery for the E-TECH YouTube channel.

Live dashboard:
https://gautamkrsingh9576-a11y.github.io/gautamsingh/

## System

YouTube Data API → GitHub Actions → Firebase Firestore → AI idea generation → E-TECH dashboard → Telegram / Discord digest

NewsTeen75 is not used by this repository and no NewsTeen75 Firebase, Supabase, website, Android package, notifications, or automation is modified.

## Dashboard

The dashboard includes:

- Overview
- Trend Explorer
- 30-Day History
- AI Video Ideas
- Tech Deal Radar
- Competitor Momentum
- Automation Runs
- Sources
- Firebase Settings

The 30-Day History screen renders a separate column for every date and supports:

- Trend Score
- Views / Hour
- Deal Price

## Data retention

The automation is append-only for observations.

Collections:

- `trend_items`
- `trend_observations`
- `deal_items`
- `deal_observations`
- `video_ideas`
- `automation_runs`

Every automation run creates new observation documents. Older observations are not overwritten.

There is **no automatic delete job** in this repository. The dashboard reads the latest 30 days, while Firestore can retain older data until you explicitly choose an archive or cleanup policy.

## Firebase setup

Use a completely separate Firebase project for E-TECH Trend Radar.

Recommended project name:

`etech-trend-radar`

In Firebase Console:

1. Create the separate E-TECH project.
2. Enable **Firestore**.
3. Add a **Web app** and copy its Firebase web configuration.
4. Enable **Authentication → Google**.
5. Create a service-account JSON for GitHub Actions.
6. Do not use the NewsTeen75 Firebase project.

### GitHub repository secrets

Add these under:

**Settings → Secrets and variables → Actions → Repository secrets**

Required for the dashboard:

- `FIREBASE_API_KEY`
- `FIREBASE_AUTH_DOMAIN`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_STORAGE_BUCKET`
- `FIREBASE_MESSAGING_SENDER_ID`
- `FIREBASE_APP_ID`

Required for automation:

- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `YOUTUBE_API_KEY`

Recommended:

- `OPENAI_API_KEY`
- `DASHBOARD_ADMIN_EMAIL`

Optional:

- `TECH_DEALS_JSON_URL`
- `TECH_DEALS_JSON`
- `DISCORD_WEBHOOK_URL`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`

Repository variables:

- `OPENAI_MODEL` — optional, defaults to `gpt-5.6`
- `TECH_SEEDS` — optional comma-separated tech search topics

The Firebase service-account JSON must never be placed in frontend code.

## GitHub workflows

### Dashboard deployment

`.github/workflows/deploy-pages.yml`

Runs on pushes to `main`. It generates a Firebase runtime config and deploys the static dashboard to GitHub Pages.

### Daily trend automation

`.github/workflows/trend-tracker.yml`

Runs every day at **7:30 AM Asia/Kolkata** and can also be triggered manually.

It:

1. fetches YouTube technology trends;
2. searches recent high-velocity tech topics;
3. calculates views/hour and opportunity score;
4. appends trend snapshots to Firestore;
5. reads an optional approved deal feed;
6. generates prioritized AI video ideas;
7. stores ideas and run history in Firestore;
8. optionally sends Telegram/Discord digests.

### Firestore security

`.github/workflows/deploy-firestore-rules.yml`

Run this manually after setting:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_SERVICE_ACCOUNT_JSON`
- `DASHBOARD_ADMIN_EMAIL`

The deployed client rules allow dashboard reads only to the authorized Google-account email and block all client writes.

GitHub Actions writes through Firebase Admin/IAM.

## Deal data

The automation does not scrape marketplaces that prohibit scraping.

To enable Tech Deal Radar, provide either:

- `TECH_DEALS_JSON_URL` — an approved API/feed returning product JSON
- `TECH_DEALS_JSON` — JSON array supplied as a GitHub secret

Expected fields can include:

`externalId, title, source, url, price, currency, discountPct, salesRank, dealScore`

## Local/demo mode

If Firebase has not been configured, the dashboard remains usable with demo data.

The Settings page also supports pasting the public Firebase web config into the current browser as a fallback.

## Security

- NewsTeen75 remains isolated.
- Firebase Admin credentials stay server-side in GitHub Secrets.
- Static dashboard clients are read-only.
- Firestore rules require the authorized Google account.
- Historical observation documents are append-only.
- No automatic 30-day deletion is configured.
