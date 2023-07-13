**NOTE**

> - If you would like to add a `volume` adapter please submit the PR [here](https://github.com/DefiLlama/adapters).
> - If you would like to add a `liquidations` adapter, please refer to [this readme document](https://github.com/DefiLlama/DefiLlama-Adapters/tree/main/liquidations) for details.

1. Once your adapter has been merged, it takes time to show on the UI. If more than 24 hours have passed, please let us know in Discord.
2. Please enable "Allow edits by maintainers" while putting up the PR.
3. Sorry, We no longer accept fetch adapter for new projects, we prefer the tvl to computed from blockchain data, if you have trouble with creating a the adapter, please hop onto our discord, we are happy to assist you.
4. Please fill the form below **only if the PR is for listing a new protocol** else it can be ignored/replaced with reason/details about the PR
5. **For updating listing info** It is a different repo, you can find your listing in this file: https://github.com/DefiLlama/defillama-server/blob/master/defi/src/protocols/data2.ts, you can edit it there and put up a PR
6. Do not edit/push `package-lock.json` file as part of your changes, we use lockfileVersion 2, and most use v1 and using that messes up our CI
7. No need to go to our discord and announce that you've created a PR, we monitor all PRs and will review it asap

---

Name (to be shown on DefiLlama): xWin Finance

Twitter Link: https://twitter.com/xwinfinance/with_replies

List of audit links if any: https://skynet.certik.com/projects/xwinfinance

Website Link: https://xwin.finance/

Logo (High resolution, will be shown with rounded borders): https://drive.google.com/file/d/1GtPZzBEltwpJBHIkttk78aF4v94iBKr6/view

Current TVL: 4.1 Million Dollars

Treasury Addresses (if the protocol has treasury)

Chain: Binance

Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): "id": "xwin-finance"

Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): "id" 9870

Short Description (to be shown on DefiLlama):
xWIN Finance is a decentralized finance platform that brings innovation and accessibility to the world of crypto investments. With our unique robo-advisor engine, anyone can create a personalized portfolio of cryptocurrency assets and strategies with just a few clicks. Our platform also offers a range of built-in strategies, including long-short strategy, stablecoin alpha, and dollar-cost averaging, for those seeking more stable returns.

For professional fund managers, xWIN Finance provides an exceptional platform to integrate their investment strategies and connect with a global audience without worrying about infrastructure. Our advanced on-chain strategy and performance fee structure features, combined with our user-friendly interface, ensure a seamless and secure experience for fund managers.

Token address and ticker if any: 0xd88ca08d8eec1E9E09562213Ae83A7853ebB5d28 (BSC)

Category (full list at https://defillama.com/categories) Please choose only one: Services

Oracle used (Chainlink/Band/API3/TWAP or any other that you are using): Chainlink

forkedFrom (Does your project originate from another project):

methodology (what is being counted as tvl, how is tvl being calculated):
Everything that is deposited to the strategies, public vault, private vault, and staked tokens in the liquidity pool.
The strategies, public vault, and private vault all have a function to calculating in USD how much each fund is holding.
The liquidity pool is calculated by checking how much tokens each pool consists of and using our xWinPriceMaster (open source) to calculate the price of all the tokens.

Github org/user (Optional, if your code is open source, we can track activity): https://github.com/xwinfinance/xwin-finance-v2
