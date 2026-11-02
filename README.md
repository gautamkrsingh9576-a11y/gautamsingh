# Trend Radar — Tech Content Intelligence

A live dashboard for an automated AI-driven trend discovery system for a tech YouTube channel.

## What you can access

- Overview: hot trends, rising topics, top opportunities
- Trends: YouTube/search signals with views, velocity and score
- AI Video Ideas: suggested titles, hooks, angles and priority
- Tech Deals: marketplace price/deal signals
- Competitors: channel-level momentum
- Automations: GitHub Actions run history
- Sources: connected/optional data sources
- Settings: connect Supabase live data

## Live site

Expected GitHub Pages URL:

https://gautamkrsingh9576-a11y.github.io/gautamsingh/

### One-time Pages enablement

GitHub requires the repository owner to enable Pages once:

1. Open this repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment → Source**, choose **GitHub Actions**.
4. Open **Actions** and run **Deploy Trend Radar to GitHub Pages** if it does not start automatically.

After that, every push to `main` automatically updates the live dashboard.

## Demo mode

The dashboard works immediately with realistic demo data.

## Connect Supabase live data

Open **Settings** inside the dashboard and enter:

- Supabase Project URL
- Supabase **anon/public** key

Never enter a service-role key in the browser.

The connection values are stored only in your browser's localStorage.

The dashboard reads these tables from the architecture:

- `trend_items`
- `trend_observations`
- `video_ideas`
- `deal_items`
- `deal_observations`
- `automation_runs`

### Security

For private production analytics:

- keep RLS enabled;
- use Supabase Auth/admin policies before granting read access;
- keep `SUPABASE_SERVICE_ROLE_KEY` only in GitHub Actions secrets or secure server-side code;
- never commit API secrets to this repository.

## Dashboard deployment

The workflow is:

`.github/workflows/deploy-pages.yml`

It uses the official GitHub Pages Actions deployment flow.

## Future backend integration

The trend collector can write the data into Supabase through the daily GitHub Action. The dashboard is already structured around the schema from the trend-tracker architecture.

Recommended collector flow:

YouTube / approved commerce APIs → normalization → trend score → Supabase → AI ideas → notifications → dashboard.
