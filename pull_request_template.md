**NOTE**

> - If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters).
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
2. Please enable "Allow edits by maintainers" while putting up the PR.
3. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
4. Please fill the form below  **only if the PR is for listing a new protocol** else it can be ignored/replaced with reason/details about the PR
5. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can  edit it there and put up a PR
6. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
7. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

---
##### Name (to be shown on DefiLlama):


##### Twitter Link:


##### List of audit links if any:


##### Website Link:


##### Logo (High resolution, will be shown with rounded borders):


##### Current TVL:


##### Treasury Addresses (if the protocol has treasury)


##### Chain:


##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): (https://api.coingecko.com/api/v3/coins/list)


##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)


##### Short Description (to be shown on DefiLlama):


##### Token address and ticker if any:


##### Category (full list at https://defillama.com/categories) *Please choose only one:


##### Oracle used (Chainlink/Band/API3/TWAP or any other that you are using):


##### forkedFrom (Does your project originate from another project):


##### methodology (what is being counted as tvl, how is tvl being calculated):


##### Github org/user (Optional, if your code is open source, we can track activity):