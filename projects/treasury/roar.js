const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const TREASURY = '0x809e60F2C2556b5B70A372BCE6F7300f8F216f24'
const LIQUIDITY_LOCKER = '0xC34b8225e740B1c6982A07884D135524f6DbDFf7'
const GIGA_POSITION_MANAGER = '0xA79F5775b0B49E51202c48DDF03F380FaA96f641'
const ROAR = '0xf1d3e39cc61Aedd53dc40d8AFFf6aA1dD51875D0'
const WETH = ADDRESSES.robinhood.WETH

const treasuryTvl = sumTokensExport({
  owner: TREASURY,
  tokens: [WETH],
})

const lockedLiquidityTvl = sumTokensExport({
  owner: LIQUIDITY_LOCKER,
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: GIGA_POSITION_MANAGER },
  uniV3WhitelistedTokens: [WETH],
  blacklistedTokens: [ROAR],
})

const treasuryOwnTokens = sumTokensExport({
  owner: TREASURY,
  tokens: [ROAR],
})

const lockedLiquidityOwnTokens = sumTokensExport({
  owner: LIQUIDITY_LOCKER,
  resolveUniV3: true,
  uniV3ExtraConfig: { nftAddress: GIGA_POSITION_MANAGER },
  uniV3WhitelistedTokens: [ROAR],
  blacklistedTokens: [WETH],
})

module.exports = {
  methodology: 'Treasury TVL counts WETH held by the Roar Treasury and the WETH side of Giga concentrated-liquidity positions held by the protocol liquidity locker. Own tokens count ROAR held by the Treasury and the ROAR side of those locked positions. The locked liquidity is also counted by Giga DEX CL.',
  doublecounted: true,
  robinhood: {
    tvl: sdk.util.sumChainTvls([treasuryTvl, lockedLiquidityTvl]),
    ownTokens: sdk.util.sumChainTvls([treasuryOwnTokens, lockedLiquidityOwnTokens]),
  },
}
