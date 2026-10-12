# ASTROVERSE

A brand-new React + Vite + TypeScript event website for the organizer-provided local programme **NASA International Space Apps Challenge 2026**, hosted at Birla Institute of Applied Sciences, Bhimtal, Uttarakhand, **14–16 November 2026**. ASTROVERSE is the separate local identity. The closing ceremony is on **16 November**.

The website includes cinematic original artwork, accessible responsive navigation, public information pages, a three-day schedule, an institute-sourced interactive map, a genuine-photo gallery, a ten-question quiz, email-confirmed authentication, transactional team registration, a participant dashboard, public QR verification, a printable digital ID, protected organizer tools and CSV reporting.

## Important architecture decision

This project's platform requirements explicitly require **Netlify Database, Drizzle ORM and Netlify Identity**. Consequently this implementation uses managed PostgreSQL with server-side row-level security and `@netlify/identity`, **not Supabase**. No Supabase credentials are needed; no fictional Supabase integration is claimed. All persistent registrations, participants, administrator mappings, event settings and audit records are stored in Netlify Database. The browser never connects directly to PostgreSQL.

## Run locally

Use Node 22 or newer:

```sh
npm install
netlify link
netlify dev --port 8889
```

Open the local URL printed by Netlify CLI. Identity uses secure cookies; use the CLI-provided HTTPS-compatible environment when testing authenticated functionality. Plain `npm run dev` can be used to work on public pages, but does not emulate the API, database, Identity or image CDN. Images fall back to the local originals if the image CDN is unavailable. `npm run build` is the production build command. No dev server, production build or workflow tests were run during this implementation because this environment delegates validation to its build pipeline.

## Environment variables

No manually configured database connection string, authentication key or browser secret is required on Netlify. Database connection context and Identity configuration are injected by the platform. `.env.example` documents the optional public `VITE_SITE_URL`. Never use `VITE_` for secret values, and never commit `.env` files. AI generation credentials were used only in the build-time authoring environment; the deployed website performs no AI inference. The generated artwork is committed locally.

## Database setup and migrations

The site starts with a fresh database. `@netlify/database` provisions it automatically on first connection. The Drizzle schema is in `db/schema.ts`, its client in `db/index.ts`, and configuration in `drizzle.config.ts`.

Netlify applies the SQL files in `netlify/database/migrations` at deployment. Apply them in folder order if manually configuring a separate development database:

1. `20261009194231_create_event_platform/migration.sql`: backend registration-reference sequence, registrations/teams, participants, administrator mapping, configuration and audit tables, keys, indexes, constraints.
2. `20261009195244_add_registration_security/migration.sql`: closed-registration seed, email/mobile/name validation, before-insert rule checking, deferred membership consistency triggers, RLS policies and privilege revocation.
3. `20261009200058_lively_stepford_cuckoos/migration.sql`: retained the closed-by-default registration column setting.
4. `20261009205711_open_registration_after_confirmation/migration.sql`: opens the event's registration once during deployment following explicit organizer confirmation on 9 October 2026, preserving any existing team-size limits. If the configuration row is absent, it uses the existing 4–6 member defaults. The migration temporarily sets transaction-local configuration-write context and restores it afterward; it does not provision administrator accounts or change runtime authorization.

No migration drops existing tables or clears data. Do not reset an existing database. Generate future schema migrations with `npm run db:generate -- --name add_descriptive_change`; custom security changes require a corresponding custom migration. The initial migration includes a manually defined sequence, and the second includes custom policies/triggers; never replace these with schema-only regenerated SQL. Database uniqueness guarantees the reference is never duplicated. IDs follow `NASA2026-BIAS-000001`, increasing independently of frontend state. Deleted references are not reused.

### Security model

Only trusted Netlify Functions receive a database connection. The API reads the authenticated Identity user on the server, requires email confirmation, checks `administrators` by immutable user ID, and sets transaction-local PostgreSQL owner/admin settings. Never trust an email address, user metadata, query parameter or frontend route guard as authorization.

RLS is enabled and forced for registrations, participants, audit and event configuration. A team leader can read their own team. Only authorized admins can change status, edit permitted team fields or delete rejected registrations. Anonymous QR lookup returns only reference, team name, institution, category and status; never emails or mobile numbers. Administrator mappings are never exposed through an API and can only be provisioned with trusted database access. There is no public SQL endpoint. Mutation requests enforce same-origin checks. Team creation and member insertion occur in a single transaction. Deferred triggers validate member count and exactly one leader at commit. Duplicate email, mobile, account and normalized team-name registrations are rejected. CSV cells are escaped and protected against spreadsheet formula injection.

Individual team members do not automatically receive accounts or ownership access: the signed-in team leader manages this registration. Authorized leaders can choose any actual team member when generating a digital card. All such cards share the team's database-backed registration QR. A public sequential registration reference is a lookup ID, not an authentication secret. A QR code is not proof of personal identity. Add venue identity checks to operational check-in policy.

## Authorize the initial administrator

1. Netlify Identity has been enabled by the platform activation script. Confirm **Project configuration → Identity** is enabled, email confirmation is on and the site URL/email templates point to the production site.
2. Create and email-confirm an account for the intended organizer, `nasaspace1212@gmail.com`, or invite that address using the Netlify dashboard. Never hardcode a password.
3. Verify the account holder and copy their immutable Identity user ID from the trusted administration interface.
4. In the **trusted Netlify Database SQL console**, execute the following with that verified ID substituted:

```sql
INSERT INTO administrators (user_id)
VALUES ('verified-identity-user-id')
ON CONFLICT (user_id) DO NOTHING;
```

5. Sign out and back in at `/admin/login`. The server checks this database mapping on every administrator API call. Email alone never grants privileges. To revoke access, delete that user's mapping using the trusted SQL console.
6. Use `/admin/settings` to manage minimum/maximum members and open or close registration. **Registration remains closed by default** for new configuration rows and missing-configuration API responses. On 9 October 2026, the organizer explicitly confirmed authorization and the registration policies and requested opening registration. The new one-time migration opens the event on deployment, without changing existing team limits or removing the organizer's ability to close it later. No payment is collected. Detailed policy wording was not supplied in that confirmation; do not invent eligibility, retention, fee or guardian-consent terms, and retain notices for unpublished details.

Use a narrowly scoped trusted database/operator process for role provisioning, not a public endpoint. The database application role must own the tables or have explicit privileges; the automatically managed Netlify database connection is used. The mapping table has owner-only access and no public policies.

## Netlify deployment

1. Push the project through the connected repository workflow; this agent did not create a commit or trigger a manual production deployment.
2. In **Project configuration → Build & deploy**, set the build command to `npm run build`, publish directory to `dist`, base directory to the repository root and functions directory to `netlify/functions`. `netlify.toml` contains the same settings.
3. Deploy. The platform installs dependencies, builds the Vite application, bundles the API function and applies database migrations. Inspect deployment and migration logs.
4. Verify Identity confirmation/recovery redirect URLs and email delivery on the final HTTPS domain. Leave administrator creation separate from open signup.
5. Provision the administrator, confirm programme policies, set registration limits and open registration in the admin settings.
6. Check direct loading of `/register`, `/gallery`, `/dashboard`, `/verify/NASA2026-BIAS-000001` and `/admin/login`; the SPA rewrite handles client routes and Netlify reserves `/api/*` for the function.
7. Complete the acceptance checklist below before accepting real registrations. Add a canonical URL only once the organizer confirms the production domain. The platform provides the social sharing image; none is hardcoded.

## Content and assets

`public/supplied` preserves all three supplied PDFs and the hero reference. The original supplied logo remains in `public/img/event-logo.jpeg`. The replacement badge uploaded on 9 October 2026 is preserved in `public/img/event-logo-2026.jpeg`; its cropped transparent `event-mark.png` derivative appears in navigation, the footer, the browser icon and participant ID cards. ASTROVERSE remains the distinct local event name, with the institute credited separately as host. Thirty raster photographs were extracted from the PDFs into `public/gallery`; five visually repeated photographs are excluded by the manifest, leaving **25 displayed images**. Files `event-01.jpeg` through `event-20.jpeg` are preserved. No stock photos are passed off as event photos. The source PDFs are retained for provenance.

The homepage includes a scroll-driven display of five organizer-supplied archive photographs, with the image and caption changing as each moment enters view. Generic archive captions avoid inventing dates or identities. Add organizer-approved images/captions in `src/data/event.ts`. The active homepage photograph and dedicated-gallery photographs are served through Netlify Image CDN; the dedicated gallery lazy loads its image grid, and its lightbox supports previous/next controls, Escape, arrow keys and keyboard focus containment.

The original hero artwork was generated from the reference's atmosphere, not copied. It is distinct from event photography. Its optimized WebP is approximately 162 KB. A cropped planet surface now rotates independently while the surrounding scene stays stationary. The homepage uses the native mouse pointer without a decorative trailing effect. Planet and section-background animations run automatically without a pause/resume button, while system reduced-motion preferences still disable animation and show still posters. The main navigation includes an explicit Home link on desktop and in the mobile menu.

On 9 October 2026 the organizer explicitly confirmed permission/licensing for the five supplied Pinterest visuals. The four animated visuals are served locally as silent looping H.264 backgrounds for the event introduction, experience, schedule and categories, never in the hero. Those approved animations are also reused behind the gallery section, organizer section, homepage FAQs and closing invitation, without altering any genuine archive photograph. Public event pages and the main login, signup and registration pages alternate those same approved backgrounds instead of plain black surroundings. The homepage and dedicated FAQ page share the same accessible expandable questions and organizer-confirmation notices. The static third-pin design image is retained as a source asset but no longer displayed behind the quiz invitation. The homepage quiz invitation keeps its solid, image-free layout with a mission brief and a question count drawn from the actual quiz data. Videos load only near the viewport, pause when the tab is hidden, and retain poster fallbacks for reduced motion or playback failure. Text overlays keep the foreground readable. The organizer's permission confirmation and source mapping are recorded in `public/img/section-backgrounds/ATTRIBUTION.md`; ownership was not independently verified. The event introduction now includes the same editorial overview and organizer-confirmation notice as the About page, replacing the former “Earth’s challenges” section.

The map and directions link came from `https://birlainstitute.co.in/`, pointing to Birla Institute of Applied Sciences, not an arbitrary Bhimtal pin. The map is externally provided by Google. No additional travel instructions are invented. A genuine SpaceX Falcon 9 Crew-9 launch photograph (28 September 2024) from NASA's Image and Video Library is stored locally and credited to NASA / Ben Smegelsky, with source and media-use guidance in `public/img/ATTRIBUTION.md`. It is explicitly labelled external illustration, not local event footage or endorsement. Official SpaceX launch videos are linked; no unlicensed video is embedded. Approved YouTube IDs and local videos can be added to `src/data/media.ts`; responsive players use click-to-load privacy-aware YouTube embeds or native video controls.

Edit programme information in `src/data/event.ts`, quiz questions in `src/data/quiz.ts`, and registration controls through admin settings. Static editorial content deliberately does not persist operational application records.

## Actual verification performed

- Inspected both supplied JPEGs and the generated hero artwork.
- Extracted images from all three PDFs and visually inspected a gallery contact sheet; removed repeated images from display.
- Inspected the institute website and used its published Google Maps links.
- Retrieved a NASA-credited genuine SpaceX launch photograph and inspected NASA's educational/informational media-use guidance.
- Inspected all five Pinterest redirect pages; after the organizer confirmed reuse permission, downloaded and optimized four animated backgrounds and one static design image. No local build, server or workflow tests were run for this homepage update; managed platform validation remains responsible for those checks.
- Installed dependencies; installation audit reported zero vulnerabilities at that time.
- Generated the initial Drizzle migration and custom security migration.
- Ran the Netlify Identity activation script successfully.
- Reviewed implementation and package API declarations; corrected use of the actual Identity cookie/session API and `confirmedAt` field.

**Not run:** production build, typecheck, browser tests, deployed API tests, authentication email delivery, live SQL migrations, live registration, live dashboard/statistics, QR lookup against persisted registrations, print output, CSV opening, RLS penetration tests or a production deployment. The environment prohibits local build/start/test commands. Do not regard the following checklist as tested.

## Production acceptance checklist (pending)

- [ ] Automatic production build and typecheck complete without errors.
- [ ] Public routes, mobile navigation, contrast, reduced motion and image fallbacks work on desktop/mobile.
- [ ] Quiz scoring, feedback, previous/next, restart and keyboard input work.
- [ ] Gallery image loading, focus trap, Escape and arrow navigation work.
- [ ] Identity signup, email confirmation, login, logout, recovery and invitations work on HTTPS.
- [ ] Registration rejects invalid team sizes, duplicate participants, missing consent and mismatched leader email.
- [ ] Concurrent registrations persist atomically and receive distinct backend IDs.
- [ ] Each leader can only access their own team; anonymous clients cannot fetch contacts.
- [ ] Unauthenticated admin visitors are redirected; confirmed but unauthorized users are denied.
- [ ] Provisioned admin statistics, search/filter, field edits, approval/rejection, settings and permitted deletion persist.
- [ ] CSV reflects selected real records and formula-injection protection works in spreadsheet software.
- [ ] QR lookup distinguishes missing, pending, approved and rejected records without exposing PII.
- [ ] The actual leader ID card prints and saves to PDF with a readable QR code.
- [ ] Map/directions destination, contact approval and certificate status are checked by organizers.
- [ ] Consent, minor guardian consent, privacy/retention policy, capacity and abuse controls are approved before launch.

## Unconfirmed information / external dependencies

Official local-event affiliation and alignment with the global NASA competition; global 2026 dates (the official site could not be fetched from this environment); exact eligibility and individual participation rules; 4–6 team size; free participation; schedule times/activities, workshops, mentoring, speakers and awards; certificate policy; event contact/social profiles; archive dates and approved captions; approved event footage and SpaceX video reuse rights; privacy, retention and minor-consent wording. The user-provided **14–16 November 2026** programme is consistently identified as local and the closing ceremony is on **16 November**. No unconfirmed sponsor or partnership is invented.

## Downloadable source archive

`public/downloads/astroverse-source.zip` contains the complete runnable project, local assets, migrations and setup documentation. It excludes `node_modules`, `.git`, `.env`, runtime platform files and generated build artifacts. The same source is in the project repository. See `scripts/package-project.py` to regenerate the ZIP after edits.
