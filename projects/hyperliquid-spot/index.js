const axios = require('axios')

const API_URL = 'https://api.hyperliquid.xyz/info'

const assetsInfos = async () => {
  const payload = { "type": "spotMetaAndAssetCtxs" }
  const { data } = await axios.post(API_URL, payload)

  return data[0].universe.map((item) => {
    const matchingTokens = item.tokens
      .map((i) => data[0].tokens.find((token) => token.index === i))
      .filter(Boolean);
  
    const matchingCtx = data[1].find((ctx) => ctx.coin === item.name);
    return { ...item, tokens: matchingTokens, ...(matchingCtx || {}) };
  });
}

const tvl = async (api) => {
  const pools = await assetsInfos()
  const payload = { "type": "spotClearinghouseState", "user": "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF" }
  const { data } = await axios.post(API_URL, payload)

  const totalSum = data.balances.reduce((sum, token) => {
    const match = pools.find((asset) => asset.tokens[0].name === token.coin)
    const midPx = token.coin === 'USDC' ? 1 : parseFloat(match?.midPx || 0)
    const balance = parseFloat(token.total || 0)
    return sum + midPx * balance
  }, 0)

  return api.addUSDValue(totalSum)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL represents assets in HIP-2',
  misrepresentedTokens: true,
  hyperliquid: { tvl }
}