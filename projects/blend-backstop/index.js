const { stellar } = require("../helper/chain/rpcProxy");

const BACKSTOP_ID = "CAO3AGAMZVRMHITL36EJ2VZQWKYRPWMQAPDQD5YEOF3GIF7T44U4JAL3";
async function tvl() {
  return stellar.blendBackstopTvl(BACKSTOP_ID)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: `Counts the total amount of BLND-USDC LP shares held by the Blend backstop contract.`,
  hallmarks: [
    ['2025-04-24', "Calculate TVL using BLND Coin Gecko price instead of approximation via pool weights"],
    ['2025-04-28', "Only account for lp tokens held by the backstop contract"],
  ],
  stellar: {
    tvl: () => ({}),
    pool2: tvl
  },
};
