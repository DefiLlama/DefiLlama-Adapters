const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const BigNumber = require("bignumber.js");

const graphUrl = sdk.graph.modifyEndpoint(`2hcrVuaRPwMgnyejcNRYENsAtiSmRxWyoCPMVjTAG5Sg`);
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

const ADDRESS_aprMON = '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A';

async function tvl(api) {
  const res = await request(graphUrl, graphQuery);

  // Get the market with id "0"
  const market = res.markets.find(m => m.id === "1");

  if (!market) {
    throw new Error("Market with id 1 not found");
  }

  // vaultLock is the TVL in the vault (in wei/18 decimals)
  // api.add(ADDRESS_aprMON, market.vaultLock);
  const vaultLockNormalized = new BigNumber(market.vaultLock)
    .dividedBy(new BigNumber(10).pow(18))
    .toFixed(0);

  return {
    "coingecko:tether": vaultLockNormalized,
  };
}

module.exports = {
  hallmarks: [],
  monad: {
    tvl,
    // volume
  }
}
