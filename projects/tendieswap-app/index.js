const { staking } = require("../helper/staking.js");
const { getUniTVL } = require("../helper/unknownTokens.js");

const masterchef = "0x6dDb25ca46656767f8f2385D653992dC1cdb4470";
const tendie = "0x0260F440AEa04a1690aB183Dd63C5596d66A9a43"

module.exports = {
  misrepresentedTokens: true,
  tenet: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x2D2ee1a4aec9f3c8c14dFcE837e1C89b639dd1E4', }),
    // staking: staking(masterchef, tendie)
  },
};