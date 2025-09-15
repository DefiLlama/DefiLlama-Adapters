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
    headers,
    body: JSON.stringify({
      query: tokenMetricsQuery,
    }),
  }).then((res) => res.json());
  
  return result?.data?.tokenMetrics_collection || [];
};


async function getP2pData(subgraphUrl, isBorrowed = false, chainName = '') {
  const tokenMetrics = await getTokenMetrics(subgraphUrl, chainName);
  const transform = await getChainTransform(chainName);
  
  return tokenMetrics.reduce((acc, token) => {
    const totalBorrowedAmount = parseFloat(token.totalBorrowedAmount);
    const amount = totalBorrowedAmount + parseFloat(isBorrowed ? 0 : token.totalCollateralAmount);
    
    if (amount > 0) {
      const transformedToken = transform(token.id);
      acc[transformedToken] = amount;
    }
    
    return acc;
  }, {});
}

module.exports = {
  ethereum: {
    tvl: () => getP2pData(ethereumSubgraphUrl, false, 'ethereum'),
    borrowed: () => getP2pData(ethereumSubgraphUrl, true, 'ethereum'),
  },
  arbitrum: {
    tvl: () => getP2pData(arbitrumSubgraphUrl, false, 'arbitrum'),
    borrowed: () => getP2pData(arbitrumSubgraphUrl, true, 'arbitrum'),
  },
  bsc: {
    tvl: () => getP2pData(bscSubgraphUrl, false, 'bsc'),
    borrowed: () => getP2pData(bscSubgraphUrl, true, 'bsc'),
  },
  base: {
    tvl: () => getP2pData(baseSubgraphUrl, false, 'base'),
    borrowed: () => getP2pData(baseSubgraphUrl, true, 'base'),
  },
  polygon: {
    tvl: () => getP2pData(polygonPosSubgraphUrl, false, 'polygon'),
    borrowed: () => getP2pData(polygonPosSubgraphUrl, true, 'polygon'),
  },
};
// node test.js projects/p2p-lending/index.js