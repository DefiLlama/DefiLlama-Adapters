---
name: adapter-author
description: Validates whether a DefiLlama request belongs in DefiLlama-Adapters, then helps coding agents create and validate TVL adapters when it does. Use when a user wants to add a new DefiLlama TVL protocol listing, check repo fit, create or fix a TVL adapter, choose adapter helpers or registries, run `node test.js`, prepare PR metadata, or decide whether they should instead use `DefiLlama/dimension-adapters`, `DefiLlama/defillama-server`, or the `liquidations/` directory.
---

# DefiLlama TVL Adapter Author

Use this skill to help a protocol developer add or inspect a DefiLlama TVL adapter using repo-native patterns. The primary use case is creating new TVL adapters; narrow fixes to existing adapters are also supported when the user asks.

## Step 1: Initial intake

Ask one broad question to gather context:

> Tell me about the protocol, what you want added or changed on DefiLlama, why it belongs in TVL, and any chains, contracts, vaults, factories, markets, tokens, docs, oracle details, or methodology notes you already have.

After the answer, ask one unresolved question at a time. Recommend an answer when you have a defensible default. If a question can be answered by inspecting this repository or existing adapters, inspect first instead of asking. Lock each important answer before moving on to dependent decisions.

## Step 2: Repository-fit gate (required before editing)

This repository (`DefiLlama-Adapters`) is for TVL adapters that compute TVL from on-chain data. Before editing any files, decide whether the request fits. If it does not, stop and direct the user to the correct repository:

| Request type | Correct destination |
| --- | --- |
| Volume, fees, or revenue | `DefiLlama/dimension-adapters` (see this repo's `pull_request_template.md`) |
| Listing metadata only (logo, category, links) | `DefiLlama/defillama-server`, file `defi/src/protocols/data2.ts` (see `README.md`) |
| Liquidations | The `liquidations/` directory in this repo (see `README.md`) |
| New fetch/API-only TVL with no on-chain measurement | Stop and ask for chain-backed contracts, owners, vaults, pools, markets, or logs |

API-assisted discovery is acceptable when the API only enumerates pools, vaults, markets, token lists, or config; the TVL amount itself must still come from on-chain balances, calls, or logs.

## Step 3: Workflow

1. Read `README.md`, `pull_request_template.md`, and `test.js` in the repo root.
2. Confirm repository fit (Step 2). If the request belongs elsewhere, stop and direct the user.
3. If protocol facts are incomplete, follow `references/protocol-intake.md` and continue intake.
4. Classify the protocol with `references/adapter-patterns.md`, then open the matching example adapters and helpers before coding.
5. Prefer existing registry/helper patterns when the protocol cleanly matches them.
6. Before editing, present an understanding checkpoint to the user with:
   - target path or registry entry
   - protocol shape and chains
   - TVL methodology and bucket classification (`tvl`, `staking`, `pool2`, `borrowed`, `ownTokens`)
   - helper or registry choice
   - unknowns and stop/ask items
   - exact validation command
7. Edit only the adapter files needed for the chosen pattern.
8. Run the appropriate validation command:
   - Folder adapter: `node test.js projects/<protocol>/index.js`
   - Single-file adapter: `node test.js projects/<protocol>.js`
   - Registry-backed adapter: `node test.js <protocol-key>`
9. Interpret the output: total TVL must exist, chain/type breakdown should be plausible, unknown-token and pricing warnings should be understood, and zero TVL must have a clear explanation.
10. Follow `references/validation-and-pr.md` to draft the PR body from `pull_request_template.md`. Leave unknown facts as `TODO` or open questions; do not guess.

## Existing-adapter fixes

For changes to existing adapters, preserve the current pattern unless there is a concrete reason to change it. Inspect the current adapter, make the smallest correctness fix, run `node test.js` for that adapter, and revisit methodology only if the requested change affects what is counted.

## Stop and ask

Stop before coding when any of the following is ambiguous: methodology, asset inclusion, double-counting, protocol-token treatment, oracle / source of truth, chain support, contract ownership, or repository fit.

Stop before declaring PR-ready when: `node test.js` has not passed, PR metadata is missing, unknown-token output is unexplained, package or lockfile changes are present, or the result depends on an unconfirmed assumption.

## Forbidden actions

- Do not add project-specific npm dependencies.
- Do not edit `package.json`, `package-lock.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`.
- Do not create fetch/API-only TVL adapters for new projects.
- Do not put volume, fees, revenue, liquidations, or listing-only metadata updates in this repo.
- Do not invent methodology, oracle usage, token IDs, category, audits, logo, treasury addresses, or social links.
- Do not count borrowed assets as base TVL; use the lending helpers and the separate `borrowed` bucket when appropriate.
- Do not set `doublecounted`, `misrepresentedTokens`, or `permitFailure` to hide uncertainty.
- Do not open, push, or submit a PR unless the user explicitly asks.

## Behavior examples

Good: stop a fees-adapter request and direct the user to `DefiLlama/dimension-adapters` before coding.

Good: use `registries/erc4626.js` for a plain ERC4626 vault list.

Good: use API data to discover vault addresses, then derive TVL from on-chain `totalAssets`.

Bad: return a third-party API's total TVL number for a new listing.

Bad: add an npm package or touch lockfiles to support one protocol.

Bad: mark something `doublecounted` without naming the other listed protocol whose TVL overlaps.
