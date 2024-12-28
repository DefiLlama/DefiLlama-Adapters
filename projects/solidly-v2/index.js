const { uniTvlExport } = require("../helper/calculateUniTvl.js");
const { staking } = require('../helper/staking');

module.exports = {
  ethereum: {
    tvl: uniTvlExport("0x777de5Fe8117cAAA7B44f396E93a401Cf5c9D4d6", "ethereum", undefined, undefined, { hasStablePools: true, useDefaultCoreAssets: false, }),
    staking: staking("0x77730ed992D286c53F3A0838232c3957dAeaaF73", "0x777172D858dC1599914a1C4c6c9fC48c99a60990"),
  },
  hallmarks:[
    [1678410000, "USDC depeg (90% TVL in USDC-USDT)"],
    [1678842000, "Solidly V2 sunset"],
  ]
};
