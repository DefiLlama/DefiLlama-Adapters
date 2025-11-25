const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");

const graphUrl = sdk.graph.modifyEndpoint(`2wvUVLQbwNoV1vWxLuyUz5D2LmtHeusCwoqiHnWhxHvL`);
const graphQuery = gql`
{
  markets(first: 10) {
    profit
    totalTrade
    totalTradeFee
    totalUsers
    tradeVolume
    vaultLock
    id
    loss
  }
}
`;

async function tvl(api) {
  const res = await request(graphUrl, graphQuery);

  const market = res.markets.find(m => m.id === "1");

  if (!market) {
    throw new Error("Market with id 1 not found");
  }

  // vaultLock is the TVL in the vault (in wei/18 decimals)
  const vaultLockUSDC = new BigNumber(market.vaultLock)
    .dividedBy(new BigNumber(10).pow(18));

  return {
    "coingecko:tether": vaultLockUSDC.toFixed(0),
  };
}

module.exports = {
  hallmarks: [],
  monad: {
    tvl,
    // volume
  }
}
