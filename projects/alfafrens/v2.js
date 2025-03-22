/**
 * V1 Launch ..?
 * V2 Launch https://basescan.org/tx/0x6c39ce34ab8349b1b57deb1ca5228e8a57e19699cde082a7da57f0e03984149b
 */

const sdk = require("@defillama/sdk");

const { blockQuery, getBlock } = require("../helper/http");
const { transformBalances } = require("../helper/portedTokens");

const STARTING_BLOCK_NUMBER = 23573780;
// start: 27925360,

const ETHx_token_address = "0x46fd5cfb4c12d87acd3a13e92baa53240c661d93";
const ETH_token_address = "0x0000000000000000000000000000000000000000";
const AF_token_address = "0x6c90a582c166f59de91f97fa7aef7315a968b342";

const graphUrl =
  "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/alfafrens_v2/prod/gn";

const globalStatsQuery = `query get_global_stats($block: Int) {
  globalDatas(block: {number: $block}) {
    lastUpdatedTimestamp
    totalClaimed
    totalStaked
    totalSubscriptionCashbackFlowAmount
    totalSubscriptionCashbackFlowRate
    totalSubscriptionFlowAmount
    totalSubscriptionFlowRate
  }
}`;

const tvl = async (api, b, c, d) => {
  const chain = "base";
  const { globalDatas } = await blockQuery(graphUrl, globalStatsQuery, {
    api,
  });

  const [
    {
      lastUpdatedTimestamp,
      totalClaimed: af_volume,
      totalSubscriptionFlowAmount: ethx_volume,
    },
  ] = globalDatas;

  console.log(`Flow Volume: ${ethx_volume * 1e-18} $ETHx`);

  let balances = {};
  sdk.util.sumSingleBalance(balances, ETH_token_address, ethx_volume);
  return transformBalances(chain, balances);
};

module.exports = {
  timetravel: true,
  methodology: 'Total ETH streamed on the platform',
  start: STARTING_BLOCK_NUMBER,
  base: { tvl },
  hallmarks: [[1733936900, "Alfafrens V2 Launch"]],
};
