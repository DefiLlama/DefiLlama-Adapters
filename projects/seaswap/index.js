const { queryContracts, queryContract, sumTokens, } = require("../helper/chain/cosmos")
const { transformDexBalances } = require('../helper/portedTokens')
const { PromisePool } = require('@supercharge/promise-pool');
const { sliceIntoChunks, sleep } = require("../helper/utils");

const POOL_CONTRACT_CODE_ID = 64;

function extractTokenInfo(asset) {
  const { native_token, token, native, cw20, } = asset
  for (const tObject of [native_token, token, native, cw20]) {
    if (!tObject) continue
    if (typeof tObject === 'string') return tObject
    const token = tObject.denom || tObject.contract_addr
    if (token) return token
  }
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity on the DEX",
  sei: {
    tvl: async (_, _1, _2, { api, }) => {
      const chain = api.chain
      const contracts = await queryContracts({ chain, codeId: POOL_CONTRACT_CODE_ID })
      /* const data = []
      const getPairPool = (async (pair) => {
        const res = await queryContract({ contract: pair, chain, data: { info: {} } })
        const { token1_denom, token2_denom, token1_reserve, token2_reserve } = res
        data.push({
          token0: extractTokenInfo(token1_denom),
          token1: extractTokenInfo(token2_denom),
          token0Bal: token1_reserve,
          token1Bal: token2_reserve,
        })
      })
      await PromisePool
        .withConcurrency(25)
        .for(contracts)
        .process(getPairPool)
      return transformDexBalances({ chain, data }) */
      
      return sumTokens({ chain, owners: contracts })
    },
  },
};
