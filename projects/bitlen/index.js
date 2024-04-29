const { sumTokens2 } = require("../helper/unwrapLPs");

const WBTC_POOL = '0x6996c446b1bfb8cc2ef7a4bc32979de613bcefe1';
const USDT_POOL = '0xad9b8b6c60ca112ab10670d87d53e6ff86ec3c2a';
const USDC_POOL = '0x779bddc3cBc62617093CB1E27436C78DA015508E'

const config = {
  bsquared: {
    pools: [WBTC_POOL, USDT_POOL, USDC_POOL,]
  }
}

Object.keys(config).forEach(chain => {
  const { pools } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: pools })
      return sumTokens2({ api, tokensAndOwners2: [tokens, pools] })
    },
    borrowed: async (api) => {
      const tokens = await api.multiCall({ abi: 'address:underlyingToken', calls: pools })
      let debts = await api.multiCall({ abi: "uint256:totalDebt", calls: pools })
      api.add(tokens, debts)
      return sumTokens2({ api, })
    }
  }
})