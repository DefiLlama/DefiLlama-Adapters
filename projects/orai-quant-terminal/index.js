const { queryContract } = require("../helper/chain/cosmos");
const ADDRESSES = require("../helper/coreAssets.json");

const CHAIN = "orai";
const STATS_CONTRACT = "orai1rzfk6fd6d5zhm77cshdtr0vsuyu0qe0dg36evysklx8n6q8h38psxywppw";

const EMPTY_QUERY_OBJECT = {};
const QUANT_STATS_TVL_QUERY = { get_tvl: EMPTY_QUERY_OBJECT };

async function tvl() {
  const balances = {};
  const res = await queryContract({
    chain: CHAIN,
    contract: STATS_CONTRACT,
    data: QUANT_STATS_TVL_QUERY,
  });
  balances[`ARBITRUM:${ADDRESSES.arbitrum.USDC}`] = res;
  return balances;
}

module.exports = {
  arbitrum: {
    tvl
  },
  methodology: "TVL is calculated as the total value locked in the Quant Terminal vaults.",
};
