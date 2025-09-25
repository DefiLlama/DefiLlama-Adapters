const { getEnv } = require("../helper/env");
const { getChainTransform } = require('../helper/portedTokens');

const headers = {
  origin: "https://subgraph.smardex.io",
  referer: "https://subgraph.smardex.io",
  "x-api-key": process.env.SMARDEX_SUBGRAPH_API_KEY,
};

const ethereumSubgraphUrl = "https://subgraph.smardex.io/ethereum/spro";
const arbitrumSubgraphUrl = "https://subgraph.smardex.io/arbitrum/spro";
const bscSubgraphUrl = "https://subgraph.smardex.io/bsc/spro";
const baseSubgraphUrl = "https://subgraph.smardex.io/base/spro";
const polygonPosSubgraphUrl = "https://subgraph.smardex.io/polygon/spro";


const tokenMetricsQuery = `{
  tokenMetrics_collection {
    id
    totalCollateralAmount
    totalBorrowedAmount
  }
}`;

const getTokenMetrics = async (subgraphUrl, chainName) => {
  const result = await fetch(subgraphUrl, {
    method: "POST",
    headers: {
      origin: "https://subgraph.smardex.io",
      referer: "https://subgraph.smardex.io",
      "x-api-key": getEnv('SMARDEX_SUBGRAPH_API_KEY'),
    },
    body: JSON.stringify({
      query: tokenMetricsQuery,
    }),
  }).then((res) => res.json());
  
  if (!result || !result.data || !result.data.tokenMetrics_collection) {
    throw new Error(`Failed to fetch valid subgraph response for ${chainName} from ${subgraphUrl}`);
  }
  
  return result.data.tokenMetrics_collection;
};


async function getP2pData(subgraphUrl, chainName, isBorrowed = false) {
  const tokenMetrics = await getTokenMetrics(subgraphUrl, chainName);
  const transform = await getChainTransform(chainName);
  
  return tokenMetrics.reduce((acc, token) => {
    const totalBorrowedAmount = parseFloat(token.totalBorrowedAmount);
    const amount = isBorrowed ? totalBorrowedAmount : parseFloat(token.totalCollateralAmount);
    
    if (amount > 0) {
      const transformedToken = transform(token.id);
      acc[transformedToken] = amount;
    }
    
    return acc;
  }, {});
}

module.exports = {
  ethereum: {
    tvl: () => getP2pData(ethereumSubgraphUrl, 'ethereum'),
    borrowed: () => getP2pData(ethereumSubgraphUrl, 'ethereum', true),
  },
  arbitrum: {
    tvl: () => getP2pData(arbitrumSubgraphUrl, 'arbitrum'),
    borrowed: () => getP2pData(arbitrumSubgraphUrl, 'arbitrum', true),
  },
  bsc: {
    tvl: () => getP2pData(bscSubgraphUrl, 'bsc'),
    borrowed: () => getP2pData(bscSubgraphUrl, 'bsc', true),
  },
  base: {
    tvl: () => getP2pData(baseSubgraphUrl, 'base'),
    borrowed: () => getP2pData(baseSubgraphUrl, 'base', true),
  },
  polygon: {
    tvl: () => getP2pData(polygonPosSubgraphUrl, 'polygon'),
    borrowed: () => getP2pData(polygonPosSubgraphUrl, 'polygon', true),
  },
};
// node test.js projects/p2p-lending/index.js