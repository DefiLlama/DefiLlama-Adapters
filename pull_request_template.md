**NOTE**

#### Please enable "Allow edits by maintainers" while putting up the PR.

---

> - If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters).
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
2. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
3. Please fill the form below  **only if the PR is for listing a new protocol** else it can be ignored/replaced with reason/details about the PR
4. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can  edit it there and put up a PR
5. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
6. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

---
##### Name (to be shown on DefiLlama): Nyke Finance


##### Twitter Link:


##### List of audit links if any:


##### Website Link: https://nyke.finance/


##### Logo (High resolution, will be shown with rounded borders): https://avatars.githubusercontent.com/u/167595945?s=400&u=3404b3b54cae703919e2db9ea53efa2db5b99be5&v=4


##### Current TVL: Maybe $200


##### Treasury Addresses (if the protocol has treasury)


##### Chain: Ethereum Classic (ETC)


##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): (https://api.coingecko.com/api/v3/coins/list)


##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)


##### Short Description (to be shown on DefiLlama): Nyke Finance is a decentralized, non-custodial, algorithmic-based money market protocol that allows users to participate as liquidity suppliers or borrowers. Suppliers provide liquidity to the market to earn a passive income, while borrowers are able to borrow liquidity in an over-collateralized fashion. Nyke's protocol design and architecture references Compound, a proven and audited protocol.


##### Token address and ticker if any:


##### Category (full list at https://defillama.com/categories) *Please choose only one: Lending


##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.):
##### Implementation Details: Briefly describe how the oracle is integrated into your project:
##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage:

##### forkedFrom (Does your project originate from another project): CompoundV2


##### methodology (what is being counted as tvl, how is tvl being calculated): Total Supplied Assets less Total Borrowed


##### Github org/user (Optional, if your code is open source, we can track activity): 
