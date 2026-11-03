# VELORA · VIVIA · WORKBRIDGE Core

**Wellbeing. Home. Opportunity.**

The shared workflow foundation for three connected service brands: VELORA for wellness and self-care, VIVIA for rental services, and WORKBRIDGE for jobs and career opportunities.

This repository currently contains the mobile and desktop workflow hub. The wider core described below is the intended direction; live cross-platform synchronization is not yet implemented.

## Three brands, one starting point

| Brand | Core purpose | Service portal |
| --- | --- | --- |
| **VELORA** | Health, wellbeing, bodywork, spa services and luxury self-care | [Open VELORA](https://velorabysj.zite.so/) |
| **VIVIA** | Rental services, property exploration and housing applications | [Open VIVIA Rentals](https://viviarentalhomes.zite.so) |
| **WORKBRIDGE** | Job opportunities, career pathways and employment applications | [Open WORKBRIDGE](https://workbridge.zite.so) |

Bookings, applications, account access and payments continue in their respective portals. Opening a portal does not synchronize its records with the hub.

## What the core provides today

- A responsive hub for mobile and desktop.
- Direct access to all three service portals.
- An installable web app on supported browsers.
- A personal next-step checklist with pathway filters and completion tracking.
- Checklist persistence in the current browser.

The app includes a cached shell after successful service-worker installation. External services require an internet connection. Installation and offline behavior depend on the browser and hosting access controls. Clearing browser data may remove saved checklist entries.

## Shared workflow

1. **Choose a pathway** — wellness, rental services or job opportunities.
2. **Open the service portal** — continue the relevant booking or application there.
3. **Record a next step** — keep a personal reminder in the hub.
4. **Return and follow through** — complete your reminder when your action is finished.

Checklist completion is a personal action. It does not verify a booking, payment, rental application or employment outcome.

## Core architecture and ownership

| Layer | Responsibility | Current state |
| --- | --- | --- |
| Experience | Mobile/desktop navigation and personal checklist | Implemented in this repository |
| Service portals | Brand-specific bookings and applications | Linked Zite portals |
| Identity and permissions | Authorized access for customers, candidates, providers and operators | Shared hub identity/roles are planned; existing portal access stays separate |
| Operational records | Verified service, property and application status | No shared operational datastore in this repository |
| Integrations | Authorized data exchange, event handling and reconciliation | Reference work is linked; live hub integrations are pending |
| Delivery | Source review, validation and deployment | GitHub validation is included; live Site deployment remains separately managed |

The core should preserve each service's authoritative records. A portal visit, form draft or checkout start must never be treated as a verified payment, confirmed appointment or approved application.

## Integration direction

The following capabilities are planned or tracked in related repositories, rather than delivered by this README:

| Platform | Intended role | Hub status |
| --- | --- | --- |
| GitHub | Source control, issues, pull requests and CI | Repository established; in-app GitHub data access pending |
| Zite | Service apps and operational records | Three portal links available; data synchronization pending |
| Google | Documents, scheduling and communication workflows | Live hub integration pending |
| Shopify / Apntly | Designated commerce and appointment workflows | Related booking-commerce work; not imported here |
| Stripe | Designated membership/payment workflows | Separate sandbox work; no payment runtime in this repository |
| HubSpot | Permitted customer lifecycle and follow-up workflows | Related reference work; live hub routing pending |

Installing a ChatGPT plugin does not connect it automatically to this app. Any future integration must use authorized server-side access, appropriate consent and clear account/resource boundaries.

## Local development

From the repository root:

```sh
python3 -m http.server 8080 --directory apps/velora-workbridge/dist
```

Open http://localhost:8080.

The hub is buildless HTML, CSS and JavaScript. Serve its dist directory at the origin root because assets use root-relative URLs. HTTPS is required for installation away from localhost.

## Validation

With Node.js available, run from the repository root:

```sh
node scripts/validate-workbridge.mjs
```

The WORKBRIDGE hub workflow validates:

- JavaScript syntax.
- Manifest icon file paths.
- The three configured portal destinations.

These checks do not establish external service availability, payment readiness, live plugin connectivity, property authenticity or employer eligibility.

## Repository layout

```text
apps/velora-workbridge/
  dist/                  # Maintained app source, service worker and install assets
  README.md              # App-specific setup and transfer details
  RELATED_SOURCES.json   # Pinned external branch, commit and file references
scripts/
  validate-workbridge.mjs
.github/workflows/
  workbridge-hub.yml
```

## Related repositories and source references

| Source | Related work |
| --- | --- |
| [velora-booking-commerce](https://github.com/withkoji/velora-booking-commerce) | Booking/commerce foundation and operational integration work |
| [openapi-stripe](https://github.com/withkoji/openapi-stripe) | VELORA Checkout profile and Stripe schema references |
| [ai-job-search](https://github.com/withkoji/ai-job-search) | Remote-job search and import work |

[RELATED_SOURCES.json](apps/velora-workbridge/RELATED_SOURCES.json) records pinned references across six booking-commerce branches. Those links preserve traceability; they do not copy the source repositories' runtime, database, full Git history, issues or PRs.

Review entry points:

- [App import — this repository, PR #1](https://github.com/withkoji/velora-workbridge/pull/1)
- [Original transfer preparation — PR #45](https://github.com/withkoji/velora-booking-commerce/pull/45)
- [Stripe guard candidate — PR #44](https://github.com/withkoji/velora-booking-commerce/pull/44)
- [OpenAPI documentation — PR #1](https://github.com/withkoji/openapi-stripe/pull/1)
- [Remote-job search — PR #2](https://github.com/withkoji/ai-job-search/pull/2)

Older branches require compatibility review before reuse. Do not replace newer security guards or regression tests with earlier snapshots.

## Deployment

[Open the existing hub](https://velora-workbridge-hub.parkerlane12706.chatgpt.site).

The existing Site is owner-private and uses its separately managed source repository. This GitHub import does not rebind that deployment or enable automatic publication. A future deployment change must explicitly define the source branch, validation gates, hosting access and rollback procedure.

## Security and data boundaries

- Keep API keys, OAuth credentials, webhook secrets and access tokens out of Git.
- Use server-side secret storage for future integrations.
- Keep sensitive medical, financial, identity and application details out of the browser-local checklist.
- Require authorization before reading or changing operational records.
- Verify payment and appointment evidence before updating fulfillment states.
- Design event processing for retries, deduplication and reconciliation.
- Preserve the distinction between personal reminders and authoritative service status.

## Next implementation milestones

1. Review and merge the app import and core documentation.
2. Define the shared identity, roles, data contracts and record ownership.
3. Confirm supported connector access for the hosted app.
4. Implement and verify a bounded integration for each brand.
5. Add operational visibility and failure handling.
6. Validate the complete workflow before any live release claim.

**VELORA · VIVIA · WORKBRIDGE — care for yourself, find your place, build your next chapter.**
