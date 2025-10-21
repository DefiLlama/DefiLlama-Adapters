const sdk = require("@defillama/sdk");
const { request, gql } = require("graphql-request");
const BigNumber = require('bignumber.js');

const graphUrl = `https://gateway.thegraph.com/api/51a27d13ba3a128470105507f4eca3c4/subgraphs/id/2hcrVuaRPwMgnyejcNRYENsAtiSmRxWyoCPMVjTAG5Sg`;

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

const VAULT_CONTRACT = '0x5Dcd7e6EbFE2F4C3572f569d1ba7aDEEbD8CEa4c';
const USDT_MONAD = '0xb2f82D0f38dc453D596Ad40A37799446Cc89274A';

async function tvl(api) {
  const res = await request(graphUrl, graphQuery);

  // Get the market with id "0"
  const market = res.markets.find(m => m.id === "1");

  if (!market) {
    throw new Error("Market with id 1 not found");
  }

  // vaultLock is the TVL in the vault (in wei/18 decimals)
  const vaultLockAmount = new BigNumber(market.vaultLock)
  .dividedBy(new BigNumber(10).pow(18))
  .toFixed(0);

  return {
    "coingecko:tether": vaultLockAmount,
  }
}

async function volume(api) {
  const res = await request(graphUrl, graphQuery);

  // Get the market with id "0"
  const market = res.markets.find(m => m.id === "0");

  if (!market) {
    throw new Error("Market with id 0 not found");
  }

  // tradeVolume is the cumulative trading volume (in wei/18 decimals)
  const tradeVolumeAmount = market.tradeVolume / 1e18;

  return {
    totalVolume: tradeVolumeAmount.toString()
  };
}

module.exports = {
  hallmarks: [],
  monad: {
    tvl,
    // volume
  }
}
