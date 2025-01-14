const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const owners = [
  "0xb137d135dc8482b633265c21191f50a4ba26145d", // Main treasury
  "0x8e52ca5a7a9249431f03d60d79dda5eab4930178", // ARB DAO delegate
  "0xb0b4bd94d656353a30773ac883591ddbabc0c0ba", // Previous ARBI multisig
];
const ethowners = "0x9478d820e8d38ca96610b7fcbe377822c2f60f2c"

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
      ADDRESSES.arbitrum.ARB, // ARB
      "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af", //spell
      "0x10010078a54396f62c96df8532dc2b4847d47ed3", //hnd
      "0x32eb7902d4134bf98a28b963d26de779af92a212", //rpdx
      "0xd4d42f0b6def4ce0383636770ef773390d85c61a",//sushi
      "0x2cab3abfc1670d1a452df502e216a66883cdf079",//l2dao
      "0x539bde0d7dbd336b79148aa742883198bbf60342",//magic
      "0x6694340fc020c5e6b96567843da2df01b2ce1eb6",//stg
    ],
    owners,
    ownTokens,
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,//usdc
    ],
    owners: [ethowners]
  },
});

module.exports.deadFrom = '2024-08-30'
module.exports.ethereum.tvl = () => ({})
module.exports.ethereum.ownTokens = () => ({})
module.exports.arbitrum.tvl = () => ({})
module.exports.arbitrum.ownTokens = () => ({})
