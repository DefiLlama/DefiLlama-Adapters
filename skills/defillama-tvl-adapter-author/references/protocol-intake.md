# Protocol Intake

Use this reference after the first broad context question when important facts are still missing. Ask one unresolved question at a time and lock each answer before moving to dependent decisions.

## Core facts

Gather:

- Protocol name as it should appear on DefiLlama
- Whether this is a new listing or an existing adapter update
- What the protocol does in plain language
- Chain or chains
- Contracts, owner addresses, vaults, factories, comptrollers, markets, staking contracts, pool contracts, and deployment blocks if known
- Documentation, source code, explorer links, and protocol dashboard links if available
- Token addresses and tickers
- Whether the protocol has treasury addresses
- Whether the protocol is forked from another project

## TVL methodology

Ask what user funds are actually locked and where they sit on-chain.

Clarify:

- What should count as base `tvl`
- Whether protocol-token staking should be `staking`
- Whether LP positions involving the protocol token should be `pool2`
- Whether lending debt should be reported as `borrowed` rather than counted in TVL
- Whether treasury or entity holdings should use `ownTokens`
- Whether deposits are already counted by another listed protocol and need `doublecounted`
- Whether project-specific or LP-derived pricing may require `misrepresentedTokens`

Do not infer these economic claims silently. Recommend a classification from repo examples, then ask the developer to confirm.

## Data source

The repo expects new TVL adapters to compute TVL from blockchain data. If the user only has an API endpoint that returns TVL, stop and ask for chain-backed measurement points.

API-assisted discovery can be acceptable when it returns:

- vault lists
- pool lists
- market lists
- token lists
- deployment metadata
- subgraph entities used to find contracts

The measured balances should still come from chain calls, balances, logs, or helper-supported chain APIs.

## Oracle and pricing details

For the PR template, gather:

- Oracle provider or price source used by the protocol itself
- How the oracle is integrated
- Documentation or proof for oracle usage
- Coingecko ID if listed
- CoinMarketCap ID if listed

These PR fields are metadata and methodology evidence. Do not invent them to make a PR look complete.

## Listing metadata

For new listings, gather enough to draft `pull_request_template.md`:

- Website
- Twitter or X link
- Audit links
- High-resolution logo
- Current TVL estimate
- Category from DefiLlama categories
- Short description
- GitHub org/user if open source
- Referral program answer

If fields are unknown, leave them as `TODO` or ask the user.
