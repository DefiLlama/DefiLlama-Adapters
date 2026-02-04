const { staking } = require("../helper/staking");
const { pool2 } = require("../helper/pool2");
const { sumTokens2 } = require("../helper/unwrapLPs");

// -------- Addresses --------
const config = {
  ethereum: {
    farm: "0x0cc111738b9627F6f518D746d8Ca9493E9074ABe",
    lp:   "0x22527f92f43Dc8bEa6387CE40B87EbAa21f51Df3", // USDC-NUM UniswapV2 LP
    num:  "0x3496b523e5c00a4b4150d6721320cddb234c3079", // NUM
  },
  bsc: {
    farm: "0xc0bE417Db06c4Ec2bDdD7432780AB1d47ae816Fe",
    lp:   "0x3b17F6682E8205239B5d4773CE3c1d9632743e88", // BUSD-NUM Pancake LP
    num:  "0xeceb87cf00dcbf2d4e2880223743ff087a995ad9", // NUM on BSC
  },
};

// -------- Core TVL helpers --------
// Count only the exogenous side of the LPs (exclude NUM)
function makeChainTVL(chain) {
  const { farm, lp, num } = config[chain];
  return async (_, _b, _c, { api }) =>
    sumTokens2({
      api,
      owners: [farm],          // farm contract holds the staked LPs
      tokens: [lp],            // unwrap this LP
      resolveLP: true,         // get underlying tokens
      blacklistedTokens: [num] // exclude NUM so only USDC/BUSD are counted
    });
}

// -------- Export --------
module.exports = {
  misrepresentedTokens: true,

  ethereum: {
    tvl: makeChainTVL("ethereum"),
    staking: staking(config.ethereum.farm, config.ethereum.num),
    pool2: pool2(config.ethereum.farm, config.ethereum.lp),
  },

  bsc: {
    tvl: makeChainTVL("bsc"),
    staking: staking(config.bsc.farm, config.bsc.num),
    pool2: pool2(config.bsc.farm, config.bsc.lp),
  },

  methodology:
    "Core TVL = non‑NUM assets (USDC on Ethereum, BUSD on BSC) derived from unwrapping the LP " +
    "tokens staked in the farm contracts. 'staking' tracks single‑asset NUM staking and 'pool2' " +
    "tracks full NUM‑LP staking. NUM itself is excluded from core TVL to avoid double counting.",
};
