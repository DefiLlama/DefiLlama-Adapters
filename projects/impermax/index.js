const { staking } = require('../helper/staking')
const { request, gql } = require("graphql-request");
const { toUSDTBalances } = require('../helper/balances');
const { getBlock } = require('../helper/http');
const xIMX = "0x363b2deac84f0100d63c7427335f8350f596bf59";
const IMX = "0x7b35ce522cb72e4077baeb96cb923a5529764a00";

function offset(chain) {
  switch (chain) {
    case 'ethereum':
      return 100
    case 'polygon':
      return 1000
    case 'arbitrum':
      return 2000
    case 'moonriver':
      return 60
    case 'avax':
      return 800
    case 'fantom':
      return 1500
  }
}

function getChainTvl(graphUrls, factoriesName = "uniswapFactories", tvlName = "totalLiquidityUSD") {
  const graphQuery = gql`
      query get_tvl($block: Int) {
        ${factoriesName}(
          block: { number: $block }
        ) {
          ${tvlName}
        }
      }
      `;

  return (chain) => {
    return async (timestamp, ethBlock, chainBlocks) => {
      const block = (await getBlock(timestamp, chain, chainBlocks)) - offset(chain);
      let tvl = 0
      for (const url of graphUrls[chain]) {
        const uniswapFactories = (await request(
          url,
          graphQuery,
          {
            block,
          }
        ))[factoriesName];
        const usdTvl = Number(uniswapFactories[0][tvlName]);
        tvl += usdTvl
      }

      return toUSDTBalances(tvl);
    };
  };
}


const subgraphs = {
  'ethereum': ['impermax-finance/impermax-x-uniswap1'],
  'polygon': [
    'impermax-finance/impermax-x-uniswap-v2-polygon',
    'impermax-finance/impermax-x-uniswap-v2-polygon-v2',
  ],
  'arbitrum': [
    'impermax-finance/impermax-x-uniswap-v2-arbitrum',
    'impermax-finance/impermax-arbitrum-v2',
    'impermax-finance/impermax-arbitrum-solv2',
  ],
  'moonriver': ['impermax-finance/impermax-x-uniswap-v2-moonriver'],
  'avax': [
    'impermax-finance/impermax-x-uniswap-v2-avalanche',
    'impermax-finance/impermax-avalanche-v2',
  ],
  'fantom': ['impermax-finance/impermax-x-uniswap-v2-fantom'],
}

const chainTvl = getChainTvl(
  Object.fromEntries(Object.entries(subgraphs).map(
    s => [s[0], s[1].map(i => i.startsWith("http") ? i : "https://api.thegraph.com/subgraphs/name/" + i)])),
  "impermaxFactories",
  "totalBalanceUSD"
);

module.exports = {
  arbitrum: {
    tvl: chainTvl('arbitrum')
  },
  ethereum: {
    tvl: chainTvl('ethereum'),
    //staking: staking(xIMX, IMX, 'ethereum')
  },
  avax: {
    tvl: chainTvl('avax')
  },
  polygon: {
    tvl: chainTvl('polygon')
  },
  moonriver: {
    tvl: chainTvl('moonriver')
  },
  fantom: {
    tvl: chainTvl('fantom')
  },
};
