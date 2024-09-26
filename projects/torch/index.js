const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokens } = require('../helper/chain/ton')
const { get } = require("../helper/http")

const DEX = 'EQCaEOMOR2SRcXTVSolw--rY62ghCoCRjn4Is3bBdnqYwIVZ'
const YIELD_ROUTER = 'EQDYU6gxBxFT3arWR-N9RFTfqAoQKyWk4JMgTBNOM2KL18Dw'

async function tvl(api) {
  const tokenTvl = await get('https://yield-api.torch.finance/tvl')
  
  const tvl = tokenTvl.reduce((acc, data) => {
    acc += Number(data.tvl) / 1e9
    return acc
  }, 0)

  await sumTokens({ 
    api, 
    owners: [DEX, YIELD_ROUTER],
    tokens: [ADDRESSES.ton.TON], 
  });

  api.add(ADDRESSES.ton.USDT, tvl * 1e6)
}

module.exports = {
  timetravel: false,
  ton: {
    tvl: tvl
  },
}