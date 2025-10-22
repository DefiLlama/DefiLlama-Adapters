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

  const market = res.markets.find(m => m.id === "1");

  if (!market) {
    throw new Error("Market with id 1 not found");
  }

  // vaultLock is the TVL in the vault (in wei/18 decimals)
  const vaultLockAprMON = new BigNumber(market.vaultLock)
    .dividedBy(new BigNumber(10).pow(18));
  const ratio_aprMON_MON_raw = await api.call({
    target: ADDRESS_aprMON,
    abi: 'function convertToAssets(uint256) returns (uint256)',
    params: ['1000000000000000000'],
  });
  const ratio_aprMON_MON = new BigNumber(ratio_aprMON_MON_raw)
    .dividedBy(new BigNumber(10).pow(18));
  const vaultLockMON = vaultLockAprMON.multipliedBy(ratio_aprMON_MON);

  return {
    "coingecko:tether": vaultLockMON.toFixed(0),
  };
}

module.exports = {
  hallmarks: [],
  monad: {
    tvl,
    // volume
  }
}
