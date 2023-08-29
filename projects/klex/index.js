const { onChainTvl } = require("../helper/balancer")

const { sumTokens2 } = require('../helper/unwrapLPs');
const { configPost } = require('../helper/cache')

const V2_ADDRESS = '0xb519Cf56C63F013B0320E89e1004A8DE8139dA27'; // shared by all networks

function v2(chain) {
  return async (time, ethBlock, chainBlocks, param4) => {
    const block = chainBlocks[chain]
    const { data: v2Tokens } = await configPost('kex/klaytn', 'https://graph-prod.klex.finance/subgraphs/name/klex-staging-2-mainnet', { query: '{  pools {    name    tokensList    address  }}' })
    if (!v2Tokens) return onChainTvl('0xb519Cf56C63F013B0320E89e1004A8DE8139dA27', 99368355, { onlyUseExistingCache: true, })(time, ethBlock, chainBlocks, param4)
    const tokens = [];
    const blacklist = []
    for (const { address, tokensList } of v2Tokens.pools) {
      tokens.push(...tokensList)
      blacklist.push(address)
    }
    return sumTokens2({ chain, block, owner: V2_ADDRESS, tokens, blacklistedTokens: blacklist, })
  }
}

module.exports = {
  klaytn: {
    tvl: v2("klaytn")
    // tvl: onChainTvl('0xb519Cf56C63F013B0320E89e1004A8DE8139dA27', 99368355)
  },
}