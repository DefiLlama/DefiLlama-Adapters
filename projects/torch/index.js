const ADDRESSES = require("../helper/coreAssets.json")
const { sumTokens } = require('../helper/chain/ton')
const { get } = require("../helper/http")

const DEX_V1 = 'EQCaEOMOR2SRcXTVSolw--rY62ghCoCRjn4Is3bBdnqYwIVZ' // DEX V1 Router Contract
const YIELD_ROUTER = 'EQDYU6gxBxFT3arWR-N9RFTfqAoQKyWk4JMgTBNOM2KL18Dw' // Yield Router Contract

async function tvl(api) {
  const [tokenTvl, dexV2Tvls] = await Promise.all([
    get('https://yield-api.torch.finance/tvl'), // Yield farming API
    get('http://api.torch.finance/metrics/tvl') // DEX V2 API
  ])

  const yieldTvl = tokenTvl.reduce((acc, data) => {
    acc += Number(data.tvl) / 1e9
    return acc
  }, 0)

  console.log(yieldTvl, dexV2Tvls.tvl)
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
  methodology: `The TVL calculation for Torch includes two components:
  (1) DEX TVL consists of liquidity pools value, where token prices are obtained from TONAPI for regular tokens, while LP token prices are calculated by our API using on-chain data (pool reserves and total supply).
  (2) Yield Farming TVL includes user deposits in savings accounts and farming strategies, with balances and prices aggregated through Torch's yield API and yield router contract.`.trim(),
  ton: {
    tvl: tvl
  },
}