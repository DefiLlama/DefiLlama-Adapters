---
name: defillama-tvl-adapter-author
description: Validates whether a DefiLlama request belongs in DefiLlama-Adapters, then helps coding agents create and validate TVL adapters when it does. Use when a user wants to add a new DefiLlama TVL protocol listing, check repo fit, create or fix a TVL adapter, choose adapter helpers or registries, validate `node test.js`, prepare PR metadata, or understand whether they should instead look at dimension-adapters, defillama-server, or liquidations.
---

# DefiLlama TVL Adapter Author

Use this skill to help a protocol developer add or inspect a DefiLlama TVL adapter with high-quality repo-native judgment. Optimize for new TVL adapters, but support narrow fixes to existing adapters when the user asks.

## First move

Start with one broad intake question:

```text
Tell me about the protocol, what you want added or changed on DefiLlama, why it belongs in TVL, and any chains, contracts, vaults, factories, markets, tokens, docs, oracle details, or methodology notes you already have.
```

After that answer, work grill-style:

- Ask one unresolved question at a time.
- Provide your recommended answer when useful.
- If a question can be answered by inspecting this repo or existing adapters, inspect instead of asking.
- Lock each important answer before moving to dependent decisions.

## Required repository-fit gate

Before editing files, decide whether the request belongs in this repository.

Use `DefiLlama-Adapters` for TVL adapters that compute TVL from blockchain data. If the request does not fit, stop before editing and suggest the likely DefiLlama repo or path to investigate:

- volume, fees, or revenue: use `DefiLlama/dimension-adapters` according to `pull_request_template.md`
- listing metadata only: use `DefiLlama/defillama-server` according to `README.md` and `pull_request_template.md`
- liquidations: use the liquidations path linked from `README.md`
- new fetch/API-only TVL: stop and ask for chain-backed contracts, owners, vaults, pools, markets, or logs

API-assisted discovery is allowed when the API finds pools, vaults, markets, token lists, or config, and the TVL amount is still derived from on-chain balances/calls/logs.

## Workflow

1. Read `README.md`, `pull_request_template.md`, and `test.js`.
2. Validate that the request belongs in this repository. If it does not, stop and suggest the likely DefiLlama repo or path.
3. If protocol facts are incomplete, read `references/protocol-intake.md` and continue the intake.
4. Classify the protocol need with `references/adapter-patterns.md`, then inspect the matching example adapters, registries, and helpers from that pattern before coding.
5. Prefer existing registry/helper patterns when the protocol cleanly matches them.
6. Before editing, give an understanding checkpoint:
   - target path or registry file
   - protocol shape and chains
   - TVL methodology and bucket classification
   - helper or registry choice
   - unknowns and stop/ask items
   - validation command
7. Edit only the adapter-related files needed for the chosen pattern.
8. Run `node test.js projects/<protocol>/index.js`, `node test.js projects/<protocol>.js`, or `node test.js <protocol-key>` for registry-backed adapters.
9. Interpret the output: total TVL exists, chain/type breakdown is plausible, unknown tokens and pricing warnings are understood, and zero TVL is explained.
10. Read `references/validation-and-pr.md`, prepare a PR body from `pull_request_template.md`, and leave missing facts as questions or `TODO`, not guesses.

## Existing adapter fixes

For existing adapters, preserve the current pattern unless there is a clear reason to change it. Inspect the current adapter first, make the smallest correctness fix, run `node test.js` for that adapter, and revisit methodology only if the requested change affects what is counted.

## Stop and ask

Stop before coding when methodology, asset inclusion, double-counting, protocol-token treatment, oracle/source of truth, chain support, contract ownership, or repository fit is ambiguous.

Stop before PR-ready status when `node test.js` has not passed, PR metadata is missing, unknown token output is unexplained, package/lockfile changes exist, or the result depends on an assumption the developer has not confirmed.

## Forbidden actions

- Do not add project-specific npm dependencies.
- Do not edit `package.json`, `package-lock.json`, `pnpm-lock.yaml`, or `pnpm-workspace.yaml`.
- Do not create fetch/API-only TVL adapters for new projects.
- Do not put volume, fees, revenue, liquidations, or listing-only metadata updates in this repo.
- Do not invent methodology, oracle usage, token IDs, category, audits, logo, treasury addresses, or social links.
- Do not count borrowed assets as base TVL; use the repo's lending helpers and separate `borrowed` bucket when appropriate.
- Do not set `doublecounted`, `misrepresentedTokens`, or `permitFailure` to hide uncertainty.
- Do not open, push, or submit a PR unless the user explicitly asks.

## Behavior examples

Good: stop a fees adapter request and suggest `dimension-adapters` before coding.

Good: use `registries/erc4626.js` for plain ERC4626 vaults.

Good: use API data to discover vault addresses, then derive TVL from on-chain `totalAssets`, as in the Yearn-style pattern.

Bad: return a third-party API's total TVL number for a new listing.

Bad: add a package or touch lockfiles to support one protocol.

Bad: mark something `doublecounted` without explaining the other listed protocol exposure.
