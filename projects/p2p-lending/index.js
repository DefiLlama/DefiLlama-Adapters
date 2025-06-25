const headers = {
  origin: "https://subgraph.smardex.io",
  referer: "https://subgraph.smardex.io",
  "x-api-key": process.env.SMARDEX_SUBGRAPH_API_KEY,
};

const subgraphUrl = "https://subgraph.smardex.io/ethereum/spro";

const getTokenMetrics = async () => {
  const tokenMetricsQuery = `{
    tokenMetrics_collection {
      id
      totalCollateralAmount
      totalBorrowedAmount
    }
  }`;

  const result = await fetch(subgraphUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({
      query: tokenMetricsQuery,
    }),
  }).then((res) => res.json());
  return result?.data?.tokenMetrics_collection || [];
};

async function getData(isBorrowed = false) {
  const tokenMetrics = await getTokenMetrics();

  return tokenMetrics.reduce((acc, token) => {
    const totalBorrowedAmount = parseFloat(token.totalBorrowedAmount);

    return {
      ...acc,
      [token.id]:
        // We only need to add the total collateral amount if it's not borrowed
        totalBorrowedAmount + parseFloat(isBorrowed ? 0 : token.totalCollateralAmount),
    };
  }, {});
}

module.exports = {
  ethereum: {
    tvl: () => getData(),
    borrowed: () => getData(true),
  },
};
// node test.js projects/p2p-lending/index.js
