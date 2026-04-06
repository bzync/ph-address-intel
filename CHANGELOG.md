# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.8] - 2026-04-07

### Added
- `getFullPath(code)` — resolve any PSGC code (barangay, municipality, province, or region) upward through the hierarchy, returning `{ region, province, municipality, barangay }` in a single call
- `search()` `parentCode` option — scope results to children of a given PSGC code, enabling accurate cascading dropdown searches without unrelated region cross-contamination
- `FullPath` interface exported from the package
- Comprehensive test suite covering all exported functions: O(1) getters, `getFullPath`, scoped and fuzzy `search`, `resolveAlias`, and `validate`
- Updated documentation site and README with new API entries and type definitions

## [0.1.7] - 2026-04-06

### Changed
- Documentation fixes

## [0.1.6] - 2026-04-06

### Changed
- Removed postinstall scripts from build output

## [0.1.5] - 2026-04-06

### Fixed
- Auto deployment and publish workflow improvements

## [0.1.4] - 2026-04-06

### Changed
- Updated documentation site

## [0.1.3] - 2026-04-06

### Added
- `SECURITY.md` security policy

### Changed
- Revised documentation

## [0.1.2] - 2026-04-06

### Fixed
- Package metadata corrections

## [0.1.1] - 2026-04-05

### Fixed
- Initial publish fixes

## [0.1.0] - 2026-04-05

### Added
- `getRegions`, `getProvinces`, `getMunicipalities`, `getBarangays` — hierarchical PSGC traversal
- `getRegion`, `getProvince`, `getMunicipality`, `getBarangay` — O(1) code lookups
- `lookupByZip` — resolve any Philippine ZIP code to its full address chain including barangays
- `search` — substring and fuzzy (Dice's bigram) search across all address levels
- `resolveAlias` — resolve region nicknames and abbreviations to PSGC codes
- `validate` — verify address codes exist and form a consistent PSGC hierarchy
- PSGC Q4 2025 dataset (17 regions, 80 provinces, 1,634 municipalities/cities, 42,000+ barangays)
- ZIP code dataset mapped from PhilPost zone listings
- ESM + CJS dual output with full TypeScript type declarations
- Zero runtime dependencies

[0.1.8]: https://github.com/bzync/ph-address-intel/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/bzync/ph-address-intel/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/bzync/ph-address-intel/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/bzync/ph-address-intel/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/bzync/ph-address-intel/compare/v0.1.3...v0.1.4
[0.1.3]: https://github.com/bzync/ph-address-intel/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/bzync/ph-address-intel/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/bzync/ph-address-intel/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/bzync/ph-address-intel/releases/tag/v0.1.0
