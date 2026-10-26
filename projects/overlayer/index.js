const { sumTokensExport } = require('../helper/unwrapLPs')

const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const aUSDT = '0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a'
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
const aUSDC = '0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c'
const USDG = '0xe343167631d89B6Ffc58B88d6b7fB0228795491D'
const aUSDG = '0x7c0477d085ECb607CF8429f3eC91Ae5E1e460F4F'

// Ethereum is the hub. Mint and redeem only happen here.
const backingT = '0xBb32471973caD2f6317a7f366628A90e0A94a03f'
const wrapT = '0xBfaE8C8500cD35B652373a3Ad5BaA0D604A05a29'
const backingC = '0xeF2a40901a9A985eb028a0B927b427dA9BAD2aCa'
const wrapC = '0xB17EE7D061e076ff1aD6bd2141888CFb39C0Ccdc'
const backingG = '0x51366973e57c3fec58319812e9d148dE4F772f37'
const wrapG = '0xD4E1CAF200b29585aADc9AF39c16D57C8c82EbF1'

module.exports = {
  // Collateral is supplied to Aave, which already counts those deposits.
  doublecounted: true,
  methodology: 'TVL is the USDT, USDC, and USDG collateral backing T+, C+, and G+. Mint and redeem require the wrap amount to match the collateral amount after decimals are scaled, so each wrap is a 1:1 claim on its stablecoin. Collateral is supplied to Aave, so the position is the aToken balance of each backing contract plus idle collateral on the wrap contract. Bridged OFT balances on Base and Robinhood are the same hub supply and are not counted again. Staked vault shares are claims on the wrap tokens and are not counted again.',
  ethereum: {
    tvl: sumTokensExport({
      tokensAndOwners: [
        [USDT, backingT],
        [aUSDT, backingT],
        [USDT, wrapT],
        [USDC, backingC],
        [aUSDC, backingC],
        [USDC, wrapC],
        [USDG, backingG],
        [aUSDG, backingG],
        [USDG, wrapG],
      ],
    }),
  },
}
