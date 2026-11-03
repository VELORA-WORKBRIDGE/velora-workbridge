# VELORA – WORKBRIDGE

A mobile and desktop web app that brings wellness, rental services and job opportunities into one workflow hub.

## Service portals

| Pathway | Destination |
| --- | --- |
| Health and wellbeing | https://velorabysj.zite.so/ |
| Rental services and applications | https://viviarentalhomes.zite.so |
| Job opportunities and applications | https://workbridge.zite.so |

Bookings, applications and payments continue in the linked portals. Links are navigation, not a live data integration.

## App features

- Responsive mobile and desktop layout.
- Installable web app on supported browsers.
- Personal checklist with pathway filters and completion tracking.
- Checklist storage in the current browser; no cross-device synchronization.

The hub includes an offline shell after successful service-worker caching. External portals require internet access. Installation and offline availability depend on the browser and hosting access controls.

## Run locally

From the repository root:

```sh
python3 -m http.server 8080 --directory apps/velora-workbridge/dist
```

Open http://localhost:8080. Serve the app at the origin root; its asset URLs are root-relative. Use HTTPS for installation outside localhost.

## Validate

```sh
node scripts/validate-workbridge.mjs
```

The WORKBRIDGE hub workflow checks JavaScript syntax, manifest icon files and the configured portal links. It does not test Stripe payments, external portal availability or live connector access.

## Repository structure

```text
apps/velora-workbridge/
  dist/                  # Maintained, buildless app source and installation assets
  README.md              # App-specific documentation
  RELATED_SOURCES.json   # Pinned links to related branches and repositories
scripts/validate-workbridge.mjs
.github/workflows/workbridge-hub.yml
```

## Related work and transfer status

- [App transfer PR #1](https://github.com/withkoji/velora-workbridge/pull/1)
- [Original transfer preparation PR #45](https://github.com/withkoji/velora-booking-commerce/pull/45)
- [Stripe guard candidate PR #44](https://github.com/withkoji/velora-booking-commerce/pull/44)
- [OpenAPI documentation PR](https://github.com/withkoji/openapi-stripe/pull/1)
- [Remote-job search PR](https://github.com/withkoji/ai-job-search/pull/2)

[RELATED_SOURCES.json](apps/velora-workbridge/RELATED_SOURCES.json) pins related files across six booking-commerce branches. These are external references; this repository does not contain their payment runtime, database or full Git history. Original issues and PRs remain in their source repositories.

The live hub is https://velora-workbridge-hub.parkerlane12706.chatgpt.site (owner-private). Its existing deployment source has not been rebound to this GitHub repository. This import does not deploy changes automatically.

## Integration status and security

Live GitHub, Zite, Google and other plugin data integrations inside the hub remain unimplemented. ChatGPT plugin installation does not establish app-side connectivity.

Do not commit API keys, OAuth credentials, webhook secrets or customer data. Keep personal checklist entries free of sensitive medical, financial or identity information. Clearing browser data may remove saved steps.

See the [app README](apps/velora-workbridge/README.md) for transfer and deployment details.
