# Fix24

Albanian local-services marketplace built with React, Vite and Supabase. The existing site is deployed to Vercel at https://www.fix24.site.

## Development

Node 22 or newer:

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Only publishable Supabase credentials belong in `VITE_` environment variables. The fallback public configuration points at the existing Fix24 project; it is not an admin credential. Never add a service-role key to frontend code.

## Checks

```sh
npm run lint
npm test
npm run build
```

The PostgreSQL integration test runs migrations inside PGlite and exercises ownership, private request access, matching, offers, acceptance, job transitions, review uniqueness and moderation authorization. It creates no production accounts or test listings. It tests legacy integer professional IDs as well as client input handling.

## Database rollout

Existing Fix24 already has migrations 001 and 002. Apply `supabase/migrations/003_marketplace_launch.sql` in the existing project's SQL Editor. It is transactional and can be rerun. For a fresh project, run 000, 001, 002 and 003 in order.

The migration preserves existing professional IDs, records and images. It adds offers and reviews for completed jobs, tightens ownership and storage rules, and removes anonymous profile creation. Existing profiles with no `user_id` remain visible, but their ownership must be verified by the administrator before assigning them to an account. Never auto-claim a profile solely by a publicly known email or phone number.

Profile photos live under `<auth-user-id>/<random-id>` in the public `profile-images` bucket. Request photos live under `<request-id>/<random-id>` in the private `request-photos` bucket. Signed links expire after 10 minutes. Existing legacy photos are not deleted.

Review `user_profiles` and explicitly designate the owner's verified account as admin via the database. The public signup form cannot assign admin privileges. Administrators can moderate professional profiles from `?view=admin`.

The legacy `reviews` table is retained, but direct new writes to it are disabled. All new reviews require a completed booking. Historical rating counters are preserved until new verified reviews produce an updated aggregate for that professional; historical rows remain in the database.

## Authentication and launch

In Supabase Authentication URL Configuration, set Site URL to `https://www.fix24.site` and allow these redirects:

- `https://www.fix24.site/**`
- `https://fix24.site/**`
- `http://127.0.0.1:5173/**` (local testing only)

Email signup and email confirmation stay enabled. For public signup at scale, configure a verified SMTP sender: the Supabase default mail service has recipient/rate restrictions. Do not disable email confirmation to work around email delivery. Verify signup, confirmation and password recovery with a real owner-controlled mailbox before announcing public launch.

Free Supabase projects may pause after inactivity. Monitor service availability and resume from the dashboard when necessary; no paid plan is required by this code.

## Product behavior

- Free account creation and professional profiles; no online payment collection.
- City and service search tolerates Albanian accents.
- Client requests expose only work details to matching professionals.
- Accepting an offer reveals private contact/address/photos only to the chosen provider.
- Provider starts work and requests confirmation; client completes and reviews.
- Profiles, photos and ratings are never fabricated. Errors are distinct from empty search results.
- Contact: albtirane2020@gmail.com.

## Deployment

Vercel builds using `npm run build`, with `dist` as output. `vercel.json` declares the framework and standard response headers. Apply the database migration before releasing the new frontend. Vercel's existing GitHub integration publishes main.

After deployment, verify the homepage, search, direct profile links, signup/confirmation, login, password reset, professional editing, image uploads, request/offer lifecycle, sign-out and mobile layout. Confirm contact and operating policies with the site owner before a broad public announcement.
