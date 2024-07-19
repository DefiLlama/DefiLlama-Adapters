const { getUniqueAddresses } = require('../helper/utils')
const { getConfig } = require('../helper/cache')
const archimedesAbi = require('./archimedes.json')

const baseUrl = 'https://api.2pi.network/v1'
const chains = {
  avax: 'avalanche',
  bsc: 'bsc',
  optimism: 'optimism',
  polygon: 'polygon'
}

const fetchChainAddresses = async chain => {
  const { data: { archimedes } } = await getConfig(`archimedes/${chain}`, `${baseUrl}/addresses/${chain}`)
  return getUniqueAddresses(archimedes)
}

const fetchTvl = chain => {
  return async (api) => {
    const addresses = await fetchChainAddresses(chains[chain])
    let pools = await Promise.all(addresses.map(i => api.fetchList({ withMetadata: true, target: i, lengthAbi: archimedesAbi['poolLength'], itemAbi: archimedesAbi['poolInfo'] })))
    pools = pools.flat()
    const wantTokens = pools.map(i => i.output.want)
    const calls = pools.map(i => i.input)
    const  bal = await api.multiCall({      abi: archimedesAbi.balance,      calls,    })
    api.add(wantTokens, bal)
  }
}

module.exports = {
  timetravel: false,
  ...Object.fromEntries(
    Object.keys(chains).map(chain => [
      chain, { tvl: fetchTvl(chain) }
    ])
  )
}
