const ADDRESSES = require('../helper/coreAssets.json')
const axios = require('axios')

const USDC = ADDRESSES.ethereum.USDC
const API_URL = 'https://api.hyperliquid.xyz/info'

const assetsInfos = async () => {
  const payload = { "type": "spotMetaAndAssetCtxs" }
  const { data } = await axios.post(API_URL, payload)

  return data[0].tokens.map((token) => {
    const ctxToken = data[1].find((item) => item.coin.replace("@", "") == token.index);
    return { ...token, ...ctxToken };
  });
}

const tvl = async (api) => {
  const assets = await assetsInfos()
  const payload = { "type": "spotClearinghouseState", "user": "0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF" }
  const { data } = await axios.post(API_URL, payload)

  const tokens = data.balances.map((token) => {
    const tokenHold = assets.find((item) => item.index == token.token)
    return { ...token, ...tokenHold }
  })

  const totalBalance = tokens.reduce((sum, token) => {
    const total = parseFloat(token.hold || 0);
    const markPx = parseFloat(token.markPx || 0);
    return sum + (total * markPx);
  }, 0);

  return api.add(USDC, totalBalance * 1e6, { skipChain: true })
}

module.exports = {
  methodology: 'TVL represents assets locked in limit order on the spot order book',
  misrepresentedTokens: true,
  hyperliquid: { tvl }
}