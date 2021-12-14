const sdk = require("@defillama/sdk");
const axios = require("axios");

const STATS_ABI = require("./Stats.abi.json");
const CONFIG =
  "https://firebasestorage.googleapis.com/v0/b/defi-dashboards-and-trackers.appspot.com/o/defi-llama-config.json?alt=media";

async function tvl(timestamp, block) {
  const balances = {};

  const { data: config } = await axios.get(CONFIG);

  const poolsValueLockedInBackingToken = await sdk.api.abi.multiCall({
    abi: STATS_ABI["totalValueLockedInBackingTokens"],
    calls: config.pools.map(({ address }) => ({
      target: config.stats,
      params: [address],
    })),
    block,
  });

  poolsValueLockedInBackingToken.output.forEach((call, index) => {
    const backingTokenSymbol = config.pools[index].backingToken;
    const backingTokenBalance = call.output;
    sdk.util.sumSingleBalance(
      balances,
      backingTokenSymbol,
      backingTokenBalance
    );
  });

  return balances;
}

module.exports = {
  ethereum: {
    tvl,
  },
  tvl,
};
