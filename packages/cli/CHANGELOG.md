# Changelog

All notable changes to the @drew/billing CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.5] - 2025-04-09

### Changed
- Polished example apps and CLI onboarding, with canonical templates and structured init output

## [1.2.4] - 2025-04-09

### Changed
- Bump version for publish

## [1.2.3] - 2025-04-09

### Changed
- SDK now builds correctly with JSX support
- Updated react entry to use .tsx extension

## [1.2.2] - 2025-04-09

### Fixed
- **CRITICAL:** Properly rebuilt the dist bundle to include the writeTemplateFile fix
- Template pages now correctly overwrite Next.js scaffold files
- Added console logging to show which files are being created

## [1.2.1] - 2025-04-09

### Fixed

- Template files now write correctly with robust error handling and verification
- Added logging to show which files are being created during template installation
- Fixed silent failures when writing page files (app/page.tsx, pricing, billing, demo)

## [1.2.0] - 2025-04-08

### Added

- Enhanced billing components with premium warm stone aesthetic
- New user-friendly main page templates with interactive setup guides
- Improved CLI workflow with copy-to-clipboard commands and progress indicators
- SaaS, API, and Usage template main pages with step-by-step configuration
- Live demo playground for billing components

### Changed

- Completely redesigned PricingTable, CurrentPlan, UsageMeter components
- Updated BillingPortalButton, UpgradeButton, SubscriptionGate, TrialBanner with refined styling
- CLI init flow now generates setup guide pages for non-technical users
- Template strings now use consistent warm stone color palette (#fafaf9, #1c1917, #b8860b)

### Fixed

- Removed unused userId parameter warning in upgrade-button component

## [1.1.2] - 2025-04-03

### Fixed

- Properly pass cwd through entire init flow
