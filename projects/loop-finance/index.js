const sdk = require("@defillama/sdk");
const { queryContract, getTokenBalance, getToken, } = require("../helper/chain/cosmos");
const { transformDexBalances } = require('../helper/portedTokens')
const TS = require('../terraswap/factoryTvl')

async function getPairs(chain, factory) {
  let data = { pairs: { limit: 30 } }
  let pairs = []
  let res
  do {
    if (pairs.length) {
      const lastItem = pairs[pairs.length - 1]
      data.pairs.start_after = lastItem.asset_infos
    }
    res = await queryContract({ data, contract: factory, chain })
    pairs.push(...res.pairs)
  } while (res.pairs.length >= 30)
  return pairs
}

const queries = {
  "factory0": 'terra16hdjuvghcumu6prg22cdjl96ptuay6r0hc6yns',
  "factory1": 'terra10fp5e9m5avthm76z2ujgje2atw6nc87pwdwtww',
}

function getFactoryTvl(factory) {
  return async function tvl(api) {
    const chain = api.chain
    const pairs = await getPairs(chain, factory)
    sdk.log(chain, factory, pairs.length)
    const token0s = pairs.map(i => i.asset_infos[0]).map(getToken)
    const token1s = pairs.map(i => i.asset_infos[1]).map(getToken)
    const token0Bals = await Promise.all(pairs.map(i => getTokenBalance({ chain, owner: i.contract_addr, token: i.asset_infos[0] })))
    const token1Bals = await Promise.all(pairs.map(i => getTokenBalance({ chain, owner: i.contract_addr, token: i.asset_infos[1] })))
    const data = pairs.map((_, i) => ({
      token0: token0s[i],
      token1: token1s[i],
      token0Bal: token0Bals[i],
      token1Bal: token1Bals[i],
    }))
    return transformDexBalances({ chain, data, })
  }
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  terra: { tvl: sdk.util.sumChainTvls([getFactoryTvl(queries.factory0), getFactoryTvl(queries.factory1)]) },
  juno: { tvl: TS.getFactoryTvl('juno1p4dmvjtdf3qw9394k7zl65eg8g5ehzvdxnvm9hd3ju7a7aslrmdqaspeak') },
  hallmarks: [
    [1651881600, "UST depeg"],
  ]
};
