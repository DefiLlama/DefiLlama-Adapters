# Protocol Intake

Use this reference after the first broad context question when important facts are still missing. Ask one unresolved question at a time and lock each answer before moving to dependent decisions.

## Core facts to gather

- Protocol name as it should appear on DefiLlama
- Whether this is a new listing or an update to an existing adapter
- What the protocol does, in plain language
- Chain or chains it is deployed on
- Contracts: owner addresses, vaults, factories, comptrollers, markets, staking contracts, pool contracts, deployment blocks
- Documentation, source code, explorer, and dashboard links
- Token addresses and tickers
- Treasury addresses, if any
- Whether the protocol is a fork of another project (set `forkedFrom` in PR metadata)

## TVL methodology

Ask what user funds are actually locked and where they sit on-chain. Clarify:

- What counts as base `tvl`
- Whether protocol-token staking should be `staking`
- Whether LP positions involving the protocol token should be `pool2`
- Whether lending debt should be reported as `borrowed` rather than counted in TVL
- Whether treasury or entity holdings should use `ownTokens`
- Whether deposits are already counted by another listed protocol (`doublecounted`)
- Whether project-specific or LP-derived pricing may need `misrepresentedTokens`

Do not infer these economic claims silently. Recommend a classification from a comparable adapter in `projects/`, then ask the developer to confirm.

## Data source

New TVL adapters must compute TVL from blockchain data. If the user only has an API endpoint that returns a TVL number, stop and ask for chain-backed measurement points.

API-assisted discovery is acceptable when the API returns:

- vault lists
- pool lists
- market lists
- token lists
- deployment metadata
- subgraph entities used to find contracts

Measured balances must still come from chain calls, balances, logs, or helper-supported chain APIs.

## Oracle and pricing details (PR metadata)

Gather, for the PR template:

- Oracle provider or price source used by the protocol itself
- How the oracle is integrated
- Documentation or proof for oracle usage
- Coingecko ID, if listed
- CoinMarketCap ID, if listed

Do not invent these to make the PR look complete.

## Listing metadata

For new listings, gather enough to fill `pull_request_template.md`:

- Website
- Twitter / X link
- Audit links
- High-resolution logo
- Current TVL estimate
- Category from DefiLlama categories
- Short description
- GitHub org/user, if open source
- Referral program answer

If a field is unknown, leave it as `TODO` or ask the user. Do not guess.
