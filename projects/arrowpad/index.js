const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// ArrowPad.fun launchpad on Robinhood Chain: every launch seeds the full
// token supply as single-sided Uniswap V3 liquidity and the LP NFT is locked
// forever in the ArrowPadLocker (no withdrawal function).
// TVL = value of the WETH side of the locked positions (same heuristic as
// noxa-fun / unicrypt-v3).
module.exports = {
  doublecounted: true, // pools are plain Uniswap V3, already counted as dex tvl
  methodology:
    'TVL is the WETH side of the permanently locked Uniswap V3 LP positions held by the ArrowPadLocker.',
  robinhood: {
    tvl: (api) =>
      sumTokens2({
        api,
        owners: ['0xBa9C247041a7715591c7B48f20dFBa520a7d68E9'], // ArrowPadLocker
        resolveUniV3: true,
        uniV3WhitelistedTokens: [ADDRESSES.robinhood.WETH],
        uniV3ExtraConfig: { nftAddress: '0x73991a25c818bf1f1128deaab1492d45638de0d3' },
      }),
  },
}
