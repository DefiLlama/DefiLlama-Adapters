const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const OPTION_MARKET_VAULT = '0xD4Aa38D6Ee04A401Cd7067A66201f680CbD1E7E4'
const MARKETS_REGISTRY = '0x1c5FFbaEBa3Ef9fB6C650a4FF364918Bce418675'
const FROM_BLOCK = 12885655

const MARKET_ADDED_EVENT =
  'event MarketAdded((address underlying,address collateral,address delivery,address owner,uint256 tickSize,uint256 tickSpacing,uint256 tokensPerTickSize,uint256 expiry,uint256 depositFeeBps,uint256 redeemFeeBps,uint256 makerFeeBps,uint256 takerFeeBps,uint256 rolloverFeeBps,uint8 marketType,bool isCollateralScaled,bool nonRollable,bool isSpread,bool useAbsoluteSpreadCollateral) market, uint256 marketId)'

/**
 * Sums all collateral and delivery token balances held by the Premarket vault.
 */
async function tvl(api) {
  const logs = await getLogs2({
    api,
    target: MARKETS_REGISTRY,
    fromBlock: FROM_BLOCK,
    eventAbi: MARKET_ADDED_EVENT,
    onlyArgs: true,
    transform: ({ market }) => [market.collateral, market.delivery],
  })

  const tokens = [
    ...new Set(
      logs
        .flat()
        .map((token) => token.toLowerCase())
    ),
  ]

  return sumTokens2({
    api,
    owner: OPTION_MARKET_VAULT,
    tokens,
  })
}

module.exports = {
  methodology:
    'TVL is the collateral and delivery token balances held by the Premarket OptionMarketVault.',
  start: 1776277239,
  megaeth: { tvl },
}
