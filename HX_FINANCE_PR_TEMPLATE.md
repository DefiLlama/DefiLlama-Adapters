**NOTE**

#### Please enable "Allow edits by maintainers" while putting up the PR.

---

> - If you would like to add a `volume/fees/revenue` adapter please submit the PR [here](https://github.com/DefiLlama/adapters).
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
2. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
3. Please fill the form below  **only if the PR is for listing a new protocol** else it can be ignored/replaced with reason/details about the PR
4. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can  edit it there and put up a PR
5. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
6. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

---
##### Name (to be shown on DefiLlama): 
HX Finance

##### Twitter Link:
https://twitter.com/hx_finance

##### List of audit links if any: https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/audits

##### Website Link:
https://app.hx.finance

##### Logo (High resolution, will be shown with rounded borders):
https://app.hx.finance/web-app-manifest-512x512.png

##### Current TVL:
~$100,000 (Based on pool data from subgraph)

##### Treasury Addresses (if the protocol has treasury)
N/A

##### Chain:
Hyperliquid

##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): (https://api.coingecko.com/api/v3/coins/list)


##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)


##### Short Description (to be shown on DefiLlama):
HX Finance is a decentralized privacy focused exchange (DEX) built on Hyperliquid using Algebra's concentrated liquidity AMM technology, offering efficient token swaps with dynamic fees and concentrated liquidity positions.

##### Token address and ticker if any:
N/A (No governance token)

##### Category (full list at https://defillama.com/categories) *Please choose only one:
Dexs

##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.):
TWAP (Time-Weighted Average Price)

##### Implementation Details: Briefly describe how the oracle is integrated into your project:
The Algebra Protocol includes built-in TWAP oracle functionality that tracks pool prices over time, allowing protocols and users to access reliable price feeds directly from the liquidity pools.

##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage:
https://docs.hx.finance/
https://docs.algebra.finance/

##### forkedFrom (Does your project originate from another project):
Algebra Finance (using Algebra v3 concentrated liquidity AMM)

##### methodology (what is being counted as tvl, how is tvl being calculated):
TVL is calculated as the sum of all token values locked in liquidity pools. Each pool's TVL is determined by:
1. Token0 locked amount * Token0 USD price
2. Token1 locked amount * Token1 USD price
3. Total TVL = Sum of all pool TVLs

The adapter uses the uniV3Export helper with the Algebra flag to properly calculate TVL from the factory contract.

##### Github org/user (Optional, if your code is open source, we can track activity):
https://github.com/hxfinance