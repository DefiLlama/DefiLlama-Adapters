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
##### Name (to be shown on DefiLlama): Gomble Games


##### Twitter Link: [https://twitter.com/gomblegames](https://twitter.com/gomblegames)


##### List of audit links if any: [https://beosin.com/audits/GOMBLE_202402231621.pdf](https://beosin.com/audits/GOMBLE_202402231621.pdf)


##### Website Link: [https://gomblegames.com](https://gomblegames.com)


##### Logo (High resolution, will be shown with rounded borders): https://drive.google.com/file/d/1wnbDbyQmNNl6a-DwaipxaVvKsjWl82ba/view


##### Current TVL: $14,930,000.00 (April-09-2024 14:50:44 AM +UTC)


##### Treasury Addresses (if the protocol has treasury): 0x850fA53C201c7816DE22852EE03E0A0335453F41


##### Chain: BNB Chain


##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): 


##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): 


##### Short Description (to be shown on DefiLlama): 
GOMBLE’s mission is to introduce 2 billion global casual gamers to the web3 market. 

GOMBLE starts with 1) various casual games created by Gomble and 2) later include diverse games from the 111% group(over 150 titles). In the med/long term, we aim to expand into 3) publishing business with 3rd party games and 4) evolve into a platform where users can easily create games or contribute to game ideation through User Generated Games.


##### Token address and ticker if any: No token


##### Category (full list at https://defillama.com/categories) *Please choose only one: Farm


##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.): No Oracle
##### Implementation Details: Briefly describe how the oracle is integrated into your project: No Oracle
##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage: No Oracle

##### forkedFrom (Does your project originate from another project): Not a forked project


##### methodology (what is being counted as tvl, how is tvl being calculated): We calculated the TVL based on the underlying amount of BNB, USDC, and USDT in the Venus Protocol corresponding to the balance of vBNB, vUSDC, and vUSDT that the contract holds.


##### Github org/user (Optional, if your code is open source, we can track activity): Not Open Source
