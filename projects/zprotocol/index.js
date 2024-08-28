const sdk = require('@defillama/sdk');
const {getUniTVL} = require("../helper/unknownTokens");
const {zProtocolScrollFarmingExports} = require("./scroll");

const FACTORY = "0xED93e976d43AF67Cc05aa9f6Ab3D2234358F0C81";
const FARM_MASTER = "0x7a757614fEFA05f40456016Af74262Fe53546DBa";
const ZP_TOKEN = "0x2147a89fb4608752807216D5070471c09A0DcE32";

function computeZProtocolScroll() {
  const farmingExports = zProtocolScrollFarmingExports(FARM_MASTER, FACTORY, 'scroll', ZP_TOKEN);

  return {
    tvl: async (...args) => {
      const farmingTvl = await farmingExports.scroll.tvl(...args)
      const dexTvl = await getUniTVL({ chain: 'scroll', factory: FACTORY, useDefaultCoreAssets: false })(...args);

      sdk.util.mergeBalances(farmingTvl, dexTvl);

      return farmingTvl;
    },
    staking: farmingExports.scroll.staking,
    pool2: farmingExports.scroll.pool2,
  };
}

module.exports = {
  methodology: "All of Z Protocol's DEX liquidity is counted. All of the liquidity locked through Z Protocol's FarmMaster is counted, unless it was already counted as DEX liquidity.",
  misrepresentedTokens: true,
  scroll: computeZProtocolScroll()
}