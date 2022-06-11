const { getBlock } = require("../helper/getBlock");
const { transformHarmonyAddress } = require("../helper/portedTokens");
const { calculateUniTvl } = require("../helper/calculateUniTvl");
const { getUniTVL } = require("../helper/unknownTokens");

const wONE = "bsc:0xdE976f3344cd9F06E451aF3A94a324afC3E154F4";
async function tvl(timestamp, block, chainBlocks) {
  block = await getBlock(timestamp, "harmony", chainBlocks);
  const transform = await transformHarmonyAddress();

  let balances = await calculateUniTvl(
    transform,
    block,
    "harmony",
    "0x0Dea90EC11032615E027664D2708BC292Bbd976B",
    18105518,
    true
  );

  balances["harmony"] = balances[wONE] / 10 ** 18;
  delete balances[wONE];
  return balances;
}

module.exports = {
  harmony: {
    tvl: getUniTVL({
      chain: 'harmony',
      coreAssets: [
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',   // USDT
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',   // USDC
        '0x6B175474E89094C44Da98b954EedeAC495271d0F',   // DAI
      ],
      factory: '0x0Dea90EC11032615E027664D2708BC292Bbd976B',
    })
  },
};
