const { get } = require('../helper/http')

async function tvl(api) {
  const data = await get('https://api.pacaswap.com/mainnet/coingecko/tickers_complete')  
  api.addUSDValue(data.reduce((acc, i) => acc + +i.liquidity_in_usd, 0))
}

module.exports = {
  constellation: { tvl },
  misrepresentedTokens: true,
  methodology: "Value of tokens locked in the pacaswap metagraph",
};