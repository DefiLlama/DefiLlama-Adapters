const { graphQuery } = require('../helper/http')

const endpoint = "https://api.defiedge.io/graphql";
const query = `
    query Stats($network: [Network!] $dex: [Dex!] = [Uniswap, Apeswap, Pancakeswap, Arbidex, Sushiswap]) {
      stats(network: $network, dex: $dex) {
        totalValueManaged
      }
    }
  `;

async function tvl() {
  const { api } = arguments[3]
  let tvl = 0
  const { dexes, network } = config[api.chain]
  for (const dex of dexes) {
    const results = await graphQuery(endpoint, query, { network: [network], dex: [dex] })
    tvl += results.stats.totalValueManaged
  }

  return { "usd-coin": tvl};
}

module.exports = {
  doublecounted: true,
  timetravel: false,
  misrepresentedTokens: true,
};

const config = {
  ethereum: { dexes: ["Uniswap",], network: "mainnet",},
  bsc: { dexes: ["Uniswap", "Apeswap", "Pancakeswap",], network: "bsc",},
  arbitrum: { dexes: ["Uniswap", "Arbidex", "Sushiswap"], network: "arbitrum",},
  optimism: { dexes: ["Uniswap",], network: "optimism",},
  polygon: { dexes: ["Uniswap",], network: "polygon",},
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl }
})