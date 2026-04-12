# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x   | Yes       |
| < 0.1   | No        |

Security fixes are applied to the latest minor release only.

## Reporting a Vulnerability

**Do not open a public GitHub issue for security vulnerabilities.**

Report vulnerabilities privately via [GitHub Security Advisories](https://github.com/bzync/ph-address-intel/security/advisories/new).

Include:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fix (optional)

### Response SLA

| Stage                | Target    |
|----------------------|-----------|
| Initial acknowledgment | 48 hours |
| Status update        | 7 days    |
| Patch or mitigation  | 30 days   |

You will be credited in the release notes unless you request otherwise.

## Scope

This library is an **offline, read-only address intelligence library**. It makes no network calls at runtime. The attack surface is limited to:

### In scope

- Input validation bypasses in the public API (`search`, `lookupByZip`, `validate`, `resolveAlias`, etc.)
- Prototype pollution via specially crafted input strings
- Denial-of-service via pathological inputs to the fuzzy search engine
- Malicious data injection via the PSGC or ZIP data pipeline scripts
- Supply-chain risks (malicious `devDependency`, compromised build artifact)
- Incorrect hierarchy validation that allows invalid address combinations to pass

### Out of scope

- Vulnerabilities in Node.js itself or in bundlers
- Issues that require modifying the library's source code or build output
- Data accuracy issues (incorrect PSGC codes, stale ZIP mappings) — file these as regular issues
- Vulnerabilities in `xlsx` (used only as a temporary dev-time install for data generation); these are already noted in `scripts/fetch-psgc.ts`

## Threat Model

`@bzync/ph-address-intel` is a **pure computation library** — it performs lookups and searches over a static, bundled dataset. It:

- Makes **no network requests** at runtime
- Has **no persistent state** beyond module-level Maps initialized at import time
- Has **zero runtime dependencies**
- Processes only **string inputs** from callers

The primary risks are:

1. **Input-driven DoS** — adversarial strings passed to `search()` with fuzzy mode and no limit could be expensive. The library enforces `MAX_QUERY_LENGTH = 200` and `MAX_LIMIT = 1000` to bound worst-case cost.

2. **Prototype pollution** — alias and ZIP lookups use `Object.hasOwn()` to guard against `__proto__` and `constructor` keys.

3. **Log injection** — `validate()` truncates user-supplied codes in error messages to prevent injection into structured log systems.

4. **Supply-chain** — `devDependencies` are used only at build time. The published `dist/` contains only the compiled output of this library and the bundled JSON data.

## Data Provenance

The bundled address data originates from two official sources:

- **PSGC (Philippine Standard Geographic Code)** — Published by the Philippine Statistics Authority (PSA). The Q4 2025 publication is used as the primary source for region, province, municipality, and barangay data.
- **ZIP codes** — Sourced from PHLPost (Philippine Postal Corporation) at `https://phlpost.gov.ph/zip-code-locator/`.

The data generation scripts in `scripts/` fetch and process this data offline; they are not part of the published package.

## Release Integrity

Releases are published to npm with **provenance attestations** (`--provenance`), allowing consumers to verify that the published package was built directly from this repository's CI pipeline.

To verify a release:

```bash
npm audit signatures
```

Pinned SHA digests are used for all GitHub Actions in CI to prevent hijacked action tags from executing arbitrary code in the build pipeline.

## Consumer Guidance

- Always validate PSGC codes (9 decimal digits) and ZIP codes (4 decimal digits) at your own application boundary before passing them to this library.
- Treat `search()` results as untrusted display data — sanitize before rendering to HTML.
- Pin your dependency version in `package.json` (use `"0.1.x"` not `"*"`) and run `npm audit` regularly.
- If you serve this library's output over an API, apply your own rate limiting and input length caps at the HTTP layer.
