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

const getTokenMetrics = async (subgraphUrl) => {
  const result = await fetch(subgraphUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: tokenMetricsQuery,
    }),
  }).then((res) => res.json());
  return result?.data?.tokenMetrics_collection || [];
};


async function getP2pData(subgraphUrl, isBorrowed = false) {
  const tokenMetrics = await getTokenMetrics(subgraphUrl);
  return tokenMetrics.reduce((acc, token) => {
    const totalBorrowedAmount = parseFloat(token.totalBorrowedAmount);
    return {
      ...acc,
      [token.id]: totalBorrowedAmount + parseFloat(isBorrowed ? 0 : token.totalCollateralAmount),
    };
  }, {});
}

module.exports = {
  ethereum: {
    tvl: () => getP2pData(ethereumSubgraphUrl),
    borrowed: () => getP2pData(ethereumSubgraphUrl, true),
  },
  arbitrum: {
    tvl: () => getP2pData(arbitrumSubgraphUrl),
    borrowed: () => getP2pData(arbitrumSubgraphUrl, true),
  },
  bsc: {
    tvl: () => getP2pData(bscSubgraphUrl),
    borrowed: () => getP2pData(bscSubgraphUrl, true),
  },
  base: {
    tvl: () => getP2pData(baseSubgraphUrl),
    borrowed: () => getP2pData(baseSubgraphUrl, true),
  },
  polygon: {
    tvl: () => getP2pData(polygonPosSubgraphUrl),
    borrowed: () => getP2pData(polygonPosSubgraphUrl, true),
  },
};
// node test.js projects/p2p-lending/index.js