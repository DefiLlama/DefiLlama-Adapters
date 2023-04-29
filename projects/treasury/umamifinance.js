const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const owners = [
  "0xb137d135dc8482b633265c21191f50a4ba26145d", // Main treasury
  "0x8e52ca5a7a9249431f03d60d79dda5eab4930178", // ARB DAO delegate
  "0xb0b4bd94d656353a30773ac883591ddbabc0c0ba", // Previous ARBI multisig
];
const ownTokens = [
  "0x1622bF67e6e5747b81866fE0b85178a93C7F86e3", // UMAMI
  "0x2AdAbD6E8Ce3e82f52d9998a7f64a90d294A92A4", // mUMAMI
  "0x1922C36F3bc762Ca300b4a46bB2102F84B1684aB", // cmUMAMI
];

module.exports = treasuryExports({
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.fsGLP, // fsGLP
      ADDRESSES.arbitrum.USDC, // USDC
      ADDRESSES.arbitrum.USDT, // USDT
      ADDRESSES.arbitrum.WETH, // wETH
      ADDRESSES.arbitrum.GMX, // GMX
      "0x55ff62567f09906a85183b866df84bf599a4bf70", // KROM
      "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8", // GRAIL
      "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b", // xGRAIL
      "0x912CE59144191C1204E64559FE8253a0e49E6548", // ARB
    ],
    owners,
    ownTokens,
  },
});
