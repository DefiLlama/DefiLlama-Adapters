**NOTE**

#### Please enable "Allow edits by maintainers" while putting up the PR.

---

1. If you would like to add a `volume/fees/revenue` adapter please submit the PR [here](https://github.com/DefiLlama/dimension-adapters).

2. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
3. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
4. **For updating listing info** It is a different repo, you can find your listing in [this file](https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts), you can edit it there and put up a PR
5. Please do not add new npm dependencies, do not edit/push `pnpm-lock.yaml` file as part of your changes

---
## (Needs to be filled only for new listings)

##### Name (to be shown on DefiLlama): Plaxswap

##### Twitter Link: https://x.com/plaxswap

##### List of audit links if any:

##### Website Link: https://plaxswap.io

##### Logo (High resolution, will be shown with rounded borders): https://plaxswap.io/logo.png

##### Current TVL: 9.5k USD

##### Treasury Addresses (if the protocol has treasury)

##### Chain: Polygon

##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): (https://api.coingecko.com/api/v3/coins/list)

##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)

##### Short Description (to be shown on DefiLlama): PlaxSwap is a decentralized exchange on Polygon based on PancakeSwap V2 architecture.

##### Token address and ticker if any:

##### Category (full list at https://defillama.com/categories) \*Please choose only one: Dexs
##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.): AMM TWAP pricing

##### Implementation Details: Briefly describe how the oracle is integrated into your project: Pricing is derived from PancakeSwap V2-style AMM liquidity pools on Polygon.

##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage: https://plaxswap.io

##### forkedFrom (Does your project originate from another project): PancakeSwap V2

##### methodology (what is being counted as tvl, how is tvl being calculated): TVL is calculated by summing all token liquidity across PlaxSwap LP pairs from the factory contract on Polygon.

##### Github org/user (Optional, if your code is open source, we can track activity): https://github.com/plaxswap

##### Does this project have a referral program? No