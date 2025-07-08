const { staking } = require("../helper/staking");
const { getLogs, getAddress } = require('../helper/cache/getLogs');
const { transformDexBalances } = require("../helper/portedTokens");
const { cachedGraphQuery } = require('../helper/cache')

module.exports = {
  misrepresentedTokens: true,
}

async function tvl(api) {
  const { factory, fromBlock } = config[api.chain]
  let pools

  if (api.chain === 'cronos') {
    const data = await cachedGraphQuery('croswap/cronos', 'https://graph.croswap.com/subgraphs/name/croswap/croswap-v2', `{ pairInfos { pair { id}}}`)
    pools = data.pairInfos.map(i => i.pair.id)
  } else {

    const logs = await getLogs({
      api,
      target: factory,
      topics: ['0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9'],
      fromBlock,
    })
    pools = logs.map(i => getAddress(i.data.slice(0, 64 + 2)))
  }
  const token0s = await api.multiCall({ abi: 'address:token0', calls: pools })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: pools })
  const reserves = await api.multiCall({ abi: 'function getReserves() view returns (uint112, uint112, uint32)', calls: pools })
  const data = reserves.map(([token0Bal, token1Bal], i) => ({ token0Bal, token1Bal, token1: token1s[i], token0: token0s[i] }))
  return transformDexBalances({ ...api, data, })
}

const config = {
  arbitrum: { factory: '0x8f6ecb066f2bfe31bf87e022c76f63bc4642d8bc', fromBlock: 82954506, stakingContracts: ['0x8e9DA87f58A8480dD6b8878Aa37144a5Fb2F122D'], cros: '0x780469101caBD2bFe4B596D98d4777C2a142e012' },
  cronos: { factory: '0x4ae2bd26e60741890edb9e5c7e984bb396ec26e3', fromBlock: 4807004, stakingContracts: ['0xedfe968033fd2b9a98371d052cd7f32a711e533a'], cros: '0x1Ba477CA252C0FF21c488d41759795E7E7812aB4' },
}

module.exports = {
};

Object.keys(config).forEach(chain => {
  const { stakingContracts, cros, } = config[chain]
  module.exports[chain] = {
    tvl, staking: staking(stakingContracts, cros)
  }
})