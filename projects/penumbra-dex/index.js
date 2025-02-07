const { get } = require("../helper/http")

async function tvl(api) {
  const { liquidity } = await get('https://dex.penumbra.zone/api/stats')
  if (liquidity.value.knownAssetId.metadata.symbol !== 'USDC')
    throw new Error('Unknown asset id')
  api.addCGToken('usd-coin', liquidity.value.knownAssetId.amount.lo / 1e6)
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  penumbra: { tvl }
}