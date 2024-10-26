const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
    const indexes = await api.fetchList({ lengthAbi: 'uint256:portfolioId', itemAbi: 'function getPortfolioList(uint256) view returns (address)', target: config[api.chain] })
    const [tokens, vaults] = await Promise.all([
      api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
      api.multiCall({ abi: 'address:vault', calls: indexes }),
    ])

  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true, blacklistedTokens: ['0x55d398326f99059ff775485246999027b3197955'] });
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
}

const config = {
  base : '0xf93659fb357899e092813bc3a2959ceDb3282a7f'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})