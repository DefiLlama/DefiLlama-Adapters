const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
    const indexes = await api.fetchList({ lengthAbi: 'uint256:portfolioId', itemAbi: 'function getPortfolioList(uint256) view returns (address)', target: config[api.chain] })
    const [tokens, vaults] = await Promise.all([
      api.multiCall({ abi: 'address[]:getTokens', calls: indexes }),
      api.multiCall({ abi: 'address:vault', calls: indexes }),
    ])

    const blacklistsByChain = {
      base: [
        "0x55d398326f99059ff775485246999027b3197955"
      ],
      bsc: [
        "0x4200000000000000000000000000000000000006"
      ]
    }

    const blacklistedTokens = blacklistsByChain[api.chain] || []


  const ownerTokens = tokens.map((tokens, i) => [tokens, vaults[i]]);
  return sumTokens2({ api, ownerTokens, resolveLP: true, blacklistedTokens});
}

module.exports = {
  methodology: 'calculates overall value deposited across different protocol portfolios',
}

const config = {
  base : '0xf93659fb357899e092813bc3a2959ceDb3282a7f',
  bsc: '0xA1fe1C37Bf899C7F7521082C002dFA4fEbAaA8dd'
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})