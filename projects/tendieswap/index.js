const { staking } = require("../helper/staking.js");
const { getUniTVL } = require("../helper/unknownTokens.js");

const factoryBSC = "0xb5b4aE9413dFD4d1489350dCA09B1aE6B76BD3a8";
const masterchef = "0x6dDb25ca46656767f8f2385D653992dC1cdb4470";
const tendie = "0x9853A30C69474BeD37595F9B149ad634b5c323d9"

module.exports = {
  bsc: {
    tvl: getUniTVL({
       useDefaultCoreAssets: true,
      factory: factoryBSC,
    }),
    staking: staking(masterchef, tendie)
  },
  methodology: 'TVL counts the liquidity in each of the Tendieswap pairs. Pairs are found using the factory address. Staking TVL accounts for TENDIE on its masterchef contract.'
};