const chains = {
    ethereum: 1,
    bsc: 56,
    polygon: 137,
    fantom: 250,
    arbitrum: 42161,
    optimism: 10,
    avax: 43114,
    xdai: 100,
    metis: 1088,
    celo: 42220,
    kcc: 321,
    cube: 1818,
    astar: 592,
    bitgert: 32520
}

module.exports = {
  deadFrom: '2024-09-30',
  misrepresentedTokens: true
}

Object.keys(chains).forEach((chain) => {
  module.exports[chain] = { tvl: () => ({ }) }
})