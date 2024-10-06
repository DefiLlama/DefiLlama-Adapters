const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const arbitrumAddresses = [
  "0xb137d135Dc8482B633265c21191F50a4bA26145d", // Main treasury
  "0x8E52cA5A7a9249431F03d60D79DDA5EAB4930178", // Arbitrum DAO delegate
  "0xB0B4bd94D656353a30773Ac883591DDBaBC0c0bA", // Old ARBIs multisig
  "0x4e5645bee4eD80C6FEe04DCC15D14A3AC956748A" // Multisig collecting vaults fees
];
const ethAddresses = "0x9478D820E8d38Ca96610b7FCbE377822C2F60f2c"

const ownTokens = [
  "0x79EaD7a012D97eD8DeEcE279f9bC39e264d7Eef9", // Bonsai
];

module.exports = treasuryExports({
  arbitrum: {
    tokens: [
      nullAddress, // ETH
      ADDRESSES.arbitrum.fsGLP,
      ADDRESSES.arbitrum.fGLP,
      ADDRESSES.arbitrum.USDC, // USDC.e
      ADDRESSES.arbitrum.USDC_CIRCLE, // USDC
      ADDRESSES.arbitrum.USDT,
      ADDRESSES.arbitrum.WETH,
      ADDRESSES.arbitrum.GMX,
      ADDRESSES.arbitrum.ARB,
      ADDRESSES.arbitrum.WBTC,
      "0xe4dddfe67e7164b0fe14e218d80dc4c08edc01cb", // KNC
      ADDRESSES.arbitrum.LINK, // LINK
      "0x56659245931cb6920e39c189d2a0e7dd0da2d57b", // IBEX
      "0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0", // UNI
      "0x55ff62567f09906a85183b866df84bf599a4bf70", // KROM
      "0x3d9907f9a368ad0a51be60f7da3b97cf940982d8", // GRAIL
      "0x3CAaE25Ee616f2C8E13C74dA0813402eae3F496b", // xGRAIL
      "0x3e6648c5a70a150a88bce65f4ad4d506fe15d2af", // spell
      "0x10010078a54396f62c96df8532dc2b4847d47ed3", // hnd
      "0x32eb7902d4134bf98a28b963d26de779af92a212", // rpdx
      "0xd4d42f0b6def4ce0383636770ef773390d85c61a", // sushi
      "0x2cab3abfc1670d1a452df502e216a66883cdf079", // l2dao
      "0x539bde0d7dbd336b79148aa742883198bbf60342", // magic
      "0x6694340fc020c5e6b96567843da2df01b2ce1eb6", // stg
    ],
    owners: arbitrumAddresses,
    ownTokens,
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // usdc
    ],
    owners: [ethAddresses]
  },
});
