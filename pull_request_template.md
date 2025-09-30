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
##### Name (to be shown on DefiLlama): CRIPTO NO PIX


##### Twitter Link: https://x.com/criptonopix


##### List of audit links if any:

https://dessertswap.finance/audits/NIX-TOKEN-BSC-AUDIT-42915504.pdf


##### Website Link: https://criptonopix.app.br


##### Logo (High resolution, will be shown with rounded borders): https://sdvvrmjtavjir7se.public.blob.vercel-storage.com/logo-criptonopix.png


##### Current TVL: 20k


##### Treasury Addresses (if the protocol has treasury)

   0x31EE4A9Ed7eF0CF0dcdF881eDc9c82C661a40b80
   0x90084B88c772ED1bA5dafa71430628fC6aE004ff
   0xbc15aaa0B1C37ebb7B506ADe0BFA35F16E67f534
   0xf7efE91bB756D7754aE8936e1F6041848f848AD3
   0x36E4c71917245746C45bF7A031166489986A75A8
   0x02f81Ca4CAb8fB64C82A6F1bC5E3EB32C62AFcA3
   0x7FA0a7cAF42B3CB5c3f7e4B73eBb3c797b10e4A5
   0xF952A11EB1456316e907f0B47b0dccd66c28B8B3
   0x317ba109B74F272253cF8f36c24331FBC5619f59
   0x36f15b07ebe31e05c4fcEb562bf973663EEB6Bf5
   0x6E653a3f76eCE9C3b1849b2159fDdf3bB20f0DF4
   0x16F1b9B34F2596c5538E0ad1B10C85D4B2820b82
  

##### Chain: BSC

##### Coingecko ID (so your TVL can appear on Coingecko, leave empty if not listed): nix

##### Coinmarketcap ID (so your TVL can appear on Coinmarketcap, leave empty if not listed): 27220

##### Short Description (to be shown on DefiLlama):

CriptoNoPix is Brazil’s leading crypto on-ramp and off-ramp platform, making buying and selling cryptocurrencies as simple as saying Hi.

With a sleek and intuitive interface, users can instantly purchase or cash out their digital assets directly through Pix, Brazil’s fastest and most widely used payment system.

Operating for over 4 years, CriptoNoPix already processes $10M–$20M BRL in monthly volume, providing real liquidity and utility to the crypto ecosystem. More than just a trading service, the platform bridges the gap between traditional finance and Web3, offering:
• Instant transactions with no bureaucratic hurdles
• Seamless integration with decentralized wallets
• Cashback rewards and exclusive perks for users
• Trusted, transparent, and secure operations and a HUGE Latam community.

CriptoNoPix is not just a gateway into crypto — it’s the engine driving mainstream adoption of blockchain in Brazil and setting the stage for expansion across Latin America. 🚀

##### Token address and ticker if any:

0xBe96fcF736AD906b1821Ef74A0e4e346C74e6221 - NIX

##### Category (full list at https://defillama.com/categories) *Please choose only one:
CeDeFi

##### Oracle Provider(s): Specify the oracle(s) used (e.g., Chainlink, Band, API3, TWAP, etc.):
##### Implementation Details: Briefly describe how the oracle is integrated into your project:
##### Documentation/Proof: Provide links to documentation or any other resources that verify the oracle's usage:

##### forkedFrom (Does your project originate from another project):


##### methodology (what is being counted as tvl, how is tvl being calculated):

The TVL is counted as the total value of assets held in the protocol's treasury addresses on the BSC chain. The TVL is calculated by summing the USDT, BNB, NIX and WBNB value of all tokens held in these addresses in the protocol, using real-time price data from reliable sources.

##### Github org/user (Optional, if your code is open source, we can track activity):