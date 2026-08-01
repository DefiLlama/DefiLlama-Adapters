const { post } = require('../helper/http')

async function tvl(api) {
  let data= await post('https://api.hyperliquid.xyz/info', {"type":"tvlBreakdown"})
  data = data.find(i => i.protocol === "Hyperliquid Perps DEX")
  data.tokens.forEach(i => api.addCGToken('usd-coin', +i.usdcValue))
}

module.exports = {
  misrepresentedTokens: true,
  hyperliquid: { tvl }
}