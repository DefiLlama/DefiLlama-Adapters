const { sumTokens2, nullAddress } = require('../helper/unwrapLPs')
const { getConfig, } = require('../helper/cache')
const { getLogs } = require('../helper/cache/getLogs')

async function tvl(_, _b, _cb, { api, }) {
  const indexes = await api.fetchList({ lengthAbi: 'uint256:indexId', itemAbi: 'function getIndexList(uint256) view returns (address)', target: '0xE61472Ce45e559830ECF12F6a215Cd732F4D798B' })
  const [tokens, vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
    api.multiCall({ abi: 'address:vault', calls: indexes }),
  ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true });
}

async function tvl2(_, _b, _cb, { api, }) {
  const indexes = await api.fetchList({ lengthAbi: 'uint256:indexId', itemAbi: 'function getIndexList(uint256) view returns (address)', target: '0xc4209197ebC3165863d62c4c340C113620414d97' })
  const [tokens, vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
    api.multiCall({ abi: 'address:vault', calls: indexes }),
  ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true });
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
  bsc: { 
    tvl:tvl 
  },
  arbitrum: { 
    tvl:tvl2 
  }
}
