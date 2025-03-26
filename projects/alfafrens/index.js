/**
 * Alfafrens SoFi - a project by Superfluid.
 * alfafrens.com
 * 
 * This adapter tracks amount flowing between subscribers and channels. Currently it only tracks the
 * version 2 contracts.
 * 
 * V1 Creation
 * - Stream token: $DEGENx
 * V2 Creation https://basescan.org/tx/0x6c39ce34ab8349b1b57deb1ca5228e8a57e19699cde082a7da57f0e03984149b
 * - Stream token: $ETHx [0x46fd5cfb4c12d87acd3a13e92baa53240c661d93]
 * - Reward token: $AF   [0x6c90a582c166f59de91f97fa7aef7315a968b342]
 */

const sdk = require("@defillama/sdk");

const { blockQuery, getBlock } = require("../helper/http");
const { transformBalances } = require("../helper/portedTokens");

// 23573780 is the block number the contract was created.
// const STARTING_BLOCK_NUMBER = 23573780;
const STARTING_BLOCK_NUMBER = 23604000;

const ETHx_token_address = "0x46fd5cfb4c12d87acd3a13e92baa53240c661d93";
const ETH_token_address = "0x0000000000000000000000000000000000000000";
const AF_token_address = "0x6c90a582c166f59de91f97fa7aef7315a968b342";

const graphUrl =
  "https://api.goldsky.com/api/public/project_clsnd6xsoma5j012qepvucfpp/subgraphs/alfafrens_v2_no_prune/2.0.0/gn";

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

const tvl = async (api, mainnetBlockNumber, chainsBlockNumbers) => {
  console.log(chainsBlockNumbers)
  const chain = "base";
  const { globalDatas } = await blockQuery(graphUrl, globalStatsQuery, { api });

  const [
    {
      lastUpdatedTimestamp,
      totalClaimed: af_volume,
      totalSubscriptionFlowAmount: ethx_volume,
    },
  ] = globalDatas;

  console.log(`Flow Volume: ${ethx_volume * 1e-18} $ETHx`);

  if (parseInt(ethx_volume) > 0 ){
    const balances = {};
    sdk.util.sumSingleBalance(balances, ETH_token_address, ethx_volume);
    return transformBalances(chain, balances);
  }

  return;
};

module.exports = {
  timetravel: true,
  methodology: 'Total ETH streamed on the platform',
  start: STARTING_BLOCK_NUMBER,
  base: { tvl },
  hallmarks: [[1734000000, "Alfafrens V2 Launch"]],
};
