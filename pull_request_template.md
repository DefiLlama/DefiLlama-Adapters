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
##### Name (to be shown on DefiLlama): Blockchain Capital


##### Twitter Link: https://x.com/blockchaincap


##### List of audit links if any:

##### Website Link:


##### Logo (High resolution, will be shown with rounded borders): https://s3.us-east-2.amazonaws.com/securitize-public-files/perm/b87a6054-69f9-443d-9fdc-7dc45f5b0fcf/5df3bc40-ca79-11ea-ab42-06aaa3b0661e-token-icon


##### Current TVL: 237.27 M


##### Treasury Addresses (if the protocol has treasury)


##### Chain: zkSync-era


##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): blockchain-capital
(https://api.coingecko.com/api/v3/coins/list)


##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)


##### Short Description (to be shown on DefiLlama): BCAP Token is an Ethereum-based smart contract digital token representing an indirect fractional non-voting economic interest in the sole limited partnership interest in Blockchain III Digital Liquid Venture Fund held by the Issuer Blockchain Capital TokenHub Pte. Ltd.



##### Token address and ticker if any: https://explorer.zksync.io/token/0x57fD71a86522Dc06D6255537521886057c1772A3 Blockchain Capital Token (BCAP)


##### Category (full list at https://defillama.com/categories) *Please choose only one: RWA


##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.): https://www.coingecko.com/en/coins/blockchain-capital

##### Implementation Details: Briefly describe how the oracle is integrated into your project: NAV is calculated weekly by the BCAP team and then pushed onchain from Securitize to Redstone, which then is read by CoinGecko, zkSync Explorers and others.

##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage: https://blog.redstone.finance/2025/05/06/redstone-and-securitize-catalyze-rwa-market-with-bcap-token-price-feed-on-zksync-era/
[RedStone](https://app.redstone.finance/app/feeds/zksync-era%20mainnet/bcap_fundamental/)

Oracle Link: https://explorer.zksync.io/address/0x0eF2418216476Ab5264821070B8c24b6B458F796

##### forkedFrom (Does your project originate from another project): main


##### methodology (what is being counted as tvl, how is tvl being calculated):
TVL is calculated by multiplying NAV, calculated weekly, by outstanding tokens.

##### Github org/user (Optional, if your code is open source, we can track activity):