# Validation and PR Preparation

Use this reference after implementing or inspecting an adapter.

## Local validation

Run the repo-native adapter test for the changed adapter.

Examples:

```bash
node test.js projects/pangolin/index.js
node test.js projects/aave/v3.js 2024-10-16
```

For a new custom project folder, use:

```bash
node test.js projects/<protocol>/index.js
```

For a single-file adapter, use:

```bash
node test.js projects/<protocol>.js
```

For a registry-backed adapter, use the protocol key added to the registry:

```bash
node test.js <protocol-key>
```

`test.js` can fall back to `registries.allProtocols` when the file load fails and the final path segment matches a registry protocol key. `.github/workflows/getFileList.js` uses added registry object keys to decide which protocol keys CI will test.

## Interpret test output

Do more than report "it passed." Review:

- total TVL exists
- each chain and bucket appears under the expected key
- TVL is plausible for the protocol's current state
- zero TVL has a clear explanation
- unknown tokens are expected and explained
- stale, no-price, low-confidence, or high-value token warnings are understood
- no root-level export or invalid chain/key errors remain

If `node test.js` fails, fix the adapter or stop with the exact blocker.

## Changed-file check

Before PR-ready status, check that no forbidden files changed:

- `package.json`
- `package-lock.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`

The workflow `.github/workflows/test.yml` rejects these changes for PR adapter tests.

## PR body support

Read `pull_request_template.md` and help draft the PR body for new listings. Use the user's confirmed facts. Do not invent missing facts.

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
- Oracle proof/docs
- `forkedFrom`
- Methodology
- GitHub org/user
- Referral program answer

Also remind the user to enable "Allow edits by maintainers"; both `README.md` and `pull_request_template.md` call this out.

## Ready-to-open summary

When code and metadata are ready, give the user:

- files changed
- adapter pattern used
- methodology summary
- validation command and result
- important warnings or assumptions
- PR body draft or remaining `TODO`s

Stop at ready-to-open by default. Only create, push, or open a PR if the user explicitly asks.
