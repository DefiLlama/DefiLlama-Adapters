const { staking } = require("../helper/staking.js");
const { getUniTVL } = require("../helper/unknownTokens");

const BANANA_TOKEN = "0x603c7f932ED1fc6575303D8Fb018fDCBb0f39a95";
const ABOND_TOKEN = "0x34294AfABCbaFfc616ac6614F6d2e17260b78BEd";
const MASTER_APE = "0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9";
const MASTER_APE_V2 = "0x71354AC3c695dfB1d3f595AfA5D4364e9e06339B";
const FACTORY_BSC = "0x0841BD0B734E4F5853f0dD8d7Ea041c241fb0Da6";
const FACTORY_POLYGON = "0xcf083be4164828f00cae704ec15a36d711491284";
const FACTORY_ETHEREUM = "0xBAe5dc9B19004883d0377419FeF3c2C8832d7d7B";
const FACTORY_TELOS = "0x411172Dfcd5f68307656A1ff35520841C2F7fAec";
const FACTORY_ARBITRUM = "0xCf083Be4164828f00cAE704EC15a36D711491284";

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl: getUniTVL({
      factory: FACTORY_BSC,
      useDefaultCoreAssets: true,
    }),
    staking: staking(
      [MASTER_APE, MASTER_APE_V2],
      [BANANA_TOKEN, ABOND_TOKEN],
      "bsc"
    ),
  },
  polygon: {
    tvl: getUniTVL({
      factory: FACTORY_POLYGON,
      useDefaultCoreAssets: true,
    }),
  },
  ethereum: {
    tvl: getUniTVL({ factory: FACTORY_ETHEREUM, useDefaultCoreAssets: true }),
  },
  telos: {
    tvl: getUniTVL({
      factory: FACTORY_TELOS,
      useDefaultCoreAssets: true,
    }),
  },
  arbitrum: {
    tvl: getUniTVL({
      factory: FACTORY_ARBITRUM,
      useDefaultCoreAssets: true,
    }),
  },
  methodology:
    "TVL comes from the DEX liquidity pools, staking TVL is accounted as the banana on 0x5c8D727b265DBAfaba67E050f2f739cAeEB4A6F9 and 0x71354AC3c695dfB1d3f595AfA5D4364e9e06339B",
};
