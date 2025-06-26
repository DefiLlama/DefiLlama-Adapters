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

const tvl = async (api) => {
  const addresses = await fetchChainAddresses(chains[api.chain])
  const res = await api.fetchList({  lengthAbi: 'poolLength', itemAbi: archimedesAbi['poolInfo'], calls: addresses, groupedByInput: true })
  const calls = []
  const tokens = []
  for (let i = 0; i < res.length; i++) {
    const pool = addresses[i]
    for (let j = 0; j < res[i].length; j++) {
      calls.push({ target: pool, params: j })
      tokens.push(res[i][j].want)
    }
  }
  const bals = await api.multiCall({  abi: archimedesAbi.balance, calls})
  api.add(tokens, bals)
}


Object.keys(chains).forEach(chain => {
  module.exports[chain] = { tvl }
})