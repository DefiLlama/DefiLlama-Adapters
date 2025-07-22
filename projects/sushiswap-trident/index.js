const sdk = require("@defillama/sdk");
const { getTokens, fetchAllTokens } = require("../sushiswap-bentobox/helper.js");

const polygonOldRouter = sdk.graph.modifyEndpoint('5LBvcUQthQDZTMe6cyJ7DbeokFkYeVpYYBZruHPUjMG5')

const modulesToExport = {};
const trident_chains = [
  "polygon",
  "optimism",
  // "kava",
  "metis",
  "bittorrent",
  "arbitrum",
  "bsc",
  "avax",
];

const tridentQuery = `
  query get_tokens {
    tokens(
      first: 100
      orderBy: liquidityUSD
      orderDirection: desc
      where: { liquidityUSD_gt: 0 }
    ) {
      id
      symbol
      liquidity
    }
  }
`;

async function fetchAndAddTridentTokens(api, block, subgraph) {
  const tokens = subgraph
    ? await fetchAllTokens(subgraph, tridentQuery, block, 'trident')
    : await getTokens(api, block, 'trident');

  for (const { id, liquidity } of tokens) {
    api.add(id, liquidity);
  }
}

const tvl = async (api) => {
  const block = await api.getBlock();
  await fetchAndAddTridentTokens(api, block);
  if (api.chain === 'polygon')  await fetchAndAddTridentTokens(api, block, polygonOldRouter);
}

trident_chains.forEach((chain) => {
  modulesToExport[chain] = { tvl }
});

module.exports.methodology = `TVL of Trident consist of tokens deployed into swapping pairs.`

module.exports = {
    ...modulesToExport,
};

module.exports.kava = { tvl: () => 0}
module.exports.bittorrent = { tvl: () => 0}
module.exports.bsc = { tvl: () => 0}
module.exports.avax = { tvl: () => 0}
module.exports.arbitrum = { tvl: () => 0}
module.exports.avax = { tvl: () => 0}
module.exports.metis = { tvl: () => 0}