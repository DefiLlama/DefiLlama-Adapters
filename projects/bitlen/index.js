const { sumTokens2 } = require("../helper/unwrapLPs");

const WBTC_POOL = '0x6996c446b1bfb8cc2ef7a4bc32979de613bcefe1';
const USDT_POOL = '0xad9b8b6c60ca112ab10670d87d53e6ff86ec3c2a';
const USDC_POOL = '0x779bddc3cBc62617093CB1E27436C78DA015508E';
const UBTC_POOL = '0xfAa5376d7A04cb111d5a1601CB083408c167d299'


const CORE_POOL = '0xfE345fF60ACB262848FBf3Cb11bf5811c8293Aa9';
const COREBTC_POOL = '0x95fBbAf7Ad1DB1Ee6D1Ee2ea9ddca2cda23af832';
const CORE_USDT_POOL = '0xeC225F71C065E2abD06C5C69BF0FB06C857E46cB';
const CORE_USDC_POOL = '0x514C4876e239a248dD6d40F54491Cc1C7b2D044A';
const CORE_ABTC_POOL = '0xeC81EBCEb627120FeF942e53587940277f764E93'

const config = {
  bsquared: {
    pools: [WBTC_POOL, USDT_POOL, USDC_POOL,UBTC_POOL]
  },
  core: {
    pools: [CORE_POOL, COREBTC_POOL, CORE_USDT_POOL, CORE_USDC_POOL, CORE_ABTC_POOL]
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