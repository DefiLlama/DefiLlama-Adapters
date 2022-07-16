const sdk = require("@defillama/sdk");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { stakingUnknownPricedLP } = require("../helper/staking");

const FACTORY_ADDRESS = "0x5Bb7BAE25728e9e51c25466D2A15FaE97834FD95";

async function candleTvl(timestamp, block, chainBlocks) {
  let balances = await calculateUniTvl(
    (addr) => `candle:${addr}`,
    chainBlocks.candle,
    "candle",
    FACTORY_ADDRESS,
    0,
    true
  );
  return balances;
}


module.exports = {
  candle: {
    tvl: candleTvl,
  },
  misrepresentedTokens: true,
  methodology: "TVL comes from the DEX liquidity pools.",
};
