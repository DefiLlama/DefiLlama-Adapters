const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokens } = require('../helper/chain/ton')
const { get } = require("../helper/http")

const DEX_V1 = 'EQCaEOMOR2SRcXTVSolw--rY62ghCoCRjn4Is3bBdnqYwIVZ' // DEX V1 Router Contract
const YIELD_ROUTER = 'EQDYU6gxBxFT3arWR-N9RFTfqAoQKyWk4JMgTBNOM2KL18Dw' // Yield Router Contract

async function tvl(api) {
  let yieldTvl = 0
  let dexV2Tvls = { tvl: 0 }

  try {
    const tokenTvl = await get('https://yield-api.torch.finance/tvl') // Yield API
    yieldTvl = tokenTvl.reduce((acc, data) => {
      acc += Number(data.tvl) / 1e9
      return acc
    }, 0)
  } catch (e) {
    console.log("Failed to fetch yield TVL, defaulting to 0:", e.message)
  }

  try {
    dexV2Tvls = await get('http://api.torch.finance/metrics/tvl') // DEX V2 API
  } catch (e) {
    console.log("Failed to fetch DEX V2 TVL, defaulting to 0:", e.message)
  }

  const totalTvl = yieldTvl + dexV2Tvls.tvl

  await sumTokens({ 
    api, 
    owners: [DEX_V1, YIELD_ROUTER],
    tokens: [ADDRESSES.ton.TON], 
  });

  api.add(ADDRESSES.ton.USDT, totalTvl * 1e6)
}

module.exports = {
  timetravel: false,
  methodology: `The TVL calculation for Torch includes the value of liquidity pools in DEX, where token prices are obtained from TONAPI for regular tokens, while LP token prices are calculated by our API using on-chain data (pool reserves and total supply).`.trim(),
  ton: {
    tvl: tvl
  },
}