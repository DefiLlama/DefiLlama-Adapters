const { get } = require("../helper/http")

async function tvl(_, _b, _cb, { api, }) {
  const data = await get('https://na36v10ce3.execute-api.us-east-1.amazonaws.com/API-mainnet-STAGE/shadeswap/pairs')
  return {
    tether: data.map(i => +i.liquidity_usd).filter(i=>i<1e9).reduce((a, i) => a + i)
  }

}


module.exports = {
  misrepresentedTokens: true,
  secret: {
    tvl
  }
}