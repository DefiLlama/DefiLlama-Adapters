const { sumTokens2, } = require('../helper/unwrapLPs')

async function tvl(api) {
  const indexes = await api.fetchList({ lengthAbi: 'uint256:indexId', itemAbi: 'function getIndexList(uint256) view returns (address)', target: config[api.chain] })
  const [tokens, vaults] = await Promise.all([
    api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
    api.multiCall({ abi: 'address:vault', calls: indexes }),
  ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true });
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
}

const config = {
  arbitrum: '0xc4209197ebC3165863d62c4c340C113620414d97',
  bsc: '0xE61472Ce45e559830ECF12F6a215Cd732F4D798B',
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})