Initial workflow hub release for VELORA health and wellbeing, VIVIA rental services, and WORKBRIDGE job opportunities.

Included: responsive mobile/desktop web app, three service portal links, installable web-app assets, browser-local workflow checklist, core documentation and pinned related-source references.

Downloads: web-app ZIP, SHA-256 checksum and container digest record.

Container package: `ghcr.io/withkoji/velora-workbridge:v0.1.0`.
Run: `docker run --rm -p 8080:80 ghcr.io/withkoji/velora-workbridge:v0.1.0`, then open http://localhost:8080. Private package access requires GitHub Container Registry authentication.

Validation: JavaScript syntax, manifest/icon paths, portal mapping and container HTTP smoke checks.

Scope: bookings/applications continue in Zite. Live plugin data synchronization, shared operational records and payment fulfillment are not implemented in this repository. Checklist records stay in the current browser. This release does not rebind the existing hosted Site, publish an app-store binary, or establish live payment readiness.
