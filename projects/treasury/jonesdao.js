const ADDRESSES = require("../helper/coreAssets.json");
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xFa82f1bA00b0697227E2Ad6c668abb4C50CA0b1F";
const jones = "0x10393c20975cF177a3513071bC110f7962CD67da";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [
      nullAddress,
      ADDRESSES.arbitrum.USDC, // USDC
      "0x3d9907F9a368ad0a51Be60f7Da3b97cf940982D8", // GRAIL
      ADDRESSES.arbitrum.MIM, // MIM
      "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b", // xGRAIL
      "0x616279fF3dBf57A55e3d1F2E309e5D704E4e58Ae", // jGLP-USDC CMLT-LP
      "0x2bcd0aac7D98697D8760fB291625829113E354e7", // jUSDC-WETH CMLT-LP
      "0x7241bC8035b65865156DDb5EdEf3eB32874a3AF6", // jGLP
      "0xe66998533a1992ecE9eA99cDf47686F4fc8458E0", // jUSDC old
      "0xB0BDE111812EAC913b392D80D51966eC977bE3A2", // jUSDC new
      "0xd2D1162512F927a7e282Ef43a362659E4F2a728F", // sbfGMX
    ],
    owners: [treasury],
    ownTokens: [jones],
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
    ],
    owners: [treasury],
    ownTokens: [],
  },
});
