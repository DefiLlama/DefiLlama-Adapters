**NOTE**

> - If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters).
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
2. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
3. The protocol is usually listed within 24 hours of merging the PR
4. Please fill the form below  **only if the PR is for listing a new protocol** else it can be ignored/replaced with reason/details about the PR
5. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can  edit it there and put up a PR
6. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
7. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

---
##### Name (to be shown on DefiLlama):

TProtocol

##### Twitter Link:

https://twitter.com/TProtocol_

##### List of audit links if any:

/

##### Website Link:

https://www.tprotocol.io/

##### Logo (High resolution, preferably in .svg and .png, for application on both white and black backgrounds. Will be shown with rounded borders):

- Black: https://github.com/TProtocol/Public/raw/main/img/Logo/logo-tprotocol-black-200x200.png
- White: https://github.com/TProtocol/Public/raw/main/img/Logo/logo-tprotocol-white-200x200.png

##### Current TVL:

`6,782,521.31`

##### Treasury Addresses (if the protocol has treasury)

https://etherscan.io/0xa01D9bc8343016C7DDD39852e49890a8361B2884

##### Chain:

Ethereum

##### Coingecko ID (so your TVL can appear on Coingecko): (https://api.coingecko.com/api/v3/coins/list)

/

##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap): (https://api.coinmarketcap.com/data-api/v3/map/all?listing_status=active,inactive,untracked&start=1&limit=10000)

/

##### Short Description (to be shown on DefiLlama):

First DeFi composable LSD solution for stablecoins.

##### Token address and ticker if any:

- wTBT: https://etherscan.io/token/0xD38e031f4529a07996aaB977d2B79f0e00656C56
- TBT: https://etherscan.io/token/0x07Ac55797D4F43f57cA92a49E65ca582cC287c27

##### Category (full list at https://defillama.com/categories) *Please choose only one:

DeFi

##### Oracle used (Chainlink/Band/API3/TWAP or any other that you are using):

/

##### forkedFrom (Does your project originate from another project):

/

##### methodology (what is being counted as tvl, how is tvl being calculated):

`Protocol TVL =  WTBT asset value + TBT  asset value + TREASURY asset value`
