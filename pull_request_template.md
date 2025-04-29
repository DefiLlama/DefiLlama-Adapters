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
##### Name (to be shown on DefiLlama):
Pencil Finance

##### Twitter Link:
https://x.com/pencilfinance_

##### List of audit links if any:
Audit file will be updated later.

##### Website Link:
https://www.pencilfinance.io/

##### Logo (High resolution, will be shown with rounded borders):
https://private-user-images.githubusercontent.com/188311945/438514056-86d82089-3707-40ec-81b5-3f28103f9c9e.svg?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NDU5MDY3ODYsIm5iZiI6MTc0NTkwNjQ4NiwicGF0aCI6Ii8xODgzMTE5NDUvNDM4NTE0MDU2LTg2ZDgyMDg5LTM3MDctNDBlYy04MWI1LTNmMjgxMDNmOWM5ZS5zdmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUwNDI5JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MDQyOVQwNjAxMjZaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT1kMTIxOThlMzhiODA4MmJkZTg2NmJmY2FlNDU0OTdjNTRjYWM1OTEwODg4N2RkZmE2NmFkZTM3NjUwY2JlODVlJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.gb7XYgcNBUMxvFTSClQc-G5fBpNpPPQshA76zLx8fXA

##### Current TVL:
Approximately 131 WEDU (≈ dynamic USD value), will decrease to ~10m USD within the day.

##### Treasury Addresses (if the protocol has treasury)
None specified at this time.

##### Chain:
OCC (EduChain)

##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed):
Currently not listed.

##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed):
Currently not listed.

##### Short Description (to be shown on DefiLlama):
Pencil Finance is a DeFi lending protocol that tokenizes real-world student loans, offering risk-adjusted yields via a dual-tranche system backed by off-chain repayments.

##### Token address and ticker if any:
Token: Pencil Finance Staking Vault
Ticker: PEN

##### Category (full list at https://defillama.com/categories) *Please choose only one:
RWA

##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.):
None.

##### Implementation Details: Briefly describe how the oracle is integrated into your project:
No external oracle integration. Assets are backed by real-world student loan repayments handled off-chain. Vault value is based purely on underlying token holdings.

##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage:
NA

##### forkedFrom (Does your project originate from another project):
Not forked. Pencil Finance is an original project.

##### methodology (what is being counted as tvl, how is tvl being calculated):
TVL is calculated by calling the totalAssets() function on the ERC-4626 vault smart contract.
This function returns the amount of underlying WEDU tokens managed by the vault on the OCC (EduChain) chain.

##### Github org/user (Optional, if your code is open source, we can track activity):
Currently private — planned public release post-audit.