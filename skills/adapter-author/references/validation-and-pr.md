# Validation and PR Preparation

Use this reference after implementing or inspecting an adapter.

## Local validation

Run the repo-native test for the changed adapter. Examples:

```bash
node test.js projects/pangolin/index.js
node test.js projects/aave/v3.js 2024-10-16
```

Choose the form that matches the adapter shape:

- New folder adapter: `node test.js projects/<protocol>/index.js`
- Single-file adapter: `node test.js projects/<protocol>.js`
- Registry-backed adapter: `node test.js <protocol-key>` (the key added to the registry config in `registries/`)

`test.js` falls back to `registries.allProtocols` when the file load fails and the final path segment matches a registry protocol key. `.github/workflows/getFileList.js` uses added registry keys to decide which protocol keys CI tests.

To run at a historical timestamp, append a Unix seconds value or `YYYY-MM-DD` (see `README.md`).

## Interpret test output

Do more than say "it passed." Verify:

- total TVL exists
- each chain and bucket appears under the expected key
- TVL is plausible for the protocol's current state
- zero TVL has a clear explanation
- unknown tokens are expected and explained
- stale, no-price, low-confidence, or high-value-token warnings are understood
- no root-level export or invalid chain/key errors remain

If `node test.js` fails, fix the adapter or stop and report the exact blocker.

## Changed-file check

Before declaring PR-ready, confirm none of these files changed:

- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

`.github/workflows/test.yml` rejects these changes for adapter PRs.

## PR body support

Read `pull_request_template.md` and help draft the PR body for new listings using the user's confirmed facts only. Do not invent missing facts.

Include or ask for:

- Name to show on DefiLlama
- Twitter/X link
- Audit links
- Website
- High-resolution logo
- Current TVL
- Treasury addresses, if any
- Chain
- Coingecko ID
- CoinMarketCap ID
- Short description
- Token address and ticker
- Category
- Oracle providers
- Oracle implementation details
- Oracle proof / docs
- `forkedFrom`
- Methodology
- GitHub org/user
- Referral program answer

Remind the user to enable "Allow edits by maintainers" when opening the PR (`README.md` and `pull_request_template.md` both call this out).

## Ready-to-open summary

When code and metadata are ready, give the user:

- files changed
- adapter pattern used
- methodology summary
- validation command and result
- important warnings or assumptions
- PR body draft, with remaining `TODO`s explicit

Stop at ready-to-open by default. Only create, push, or open a PR if the user explicitly asks.
