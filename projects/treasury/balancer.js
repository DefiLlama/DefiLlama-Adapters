const ADDRESSES = require("../helper/coreAssets.json");
const { karpatKeyTvl } = require("../helper/karpatkey");
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury addresses per chain
const eth = "0x10A19e7eE7d7F8a52822f6817de8ea18204F2e4f";
const eth2 = "0x0EFcCBb9E2C09Ea29551879bd9Da32362b32fc89";
const arb = "0xaF23DC5983230E9eEAf93280e312e57539D098D0";
const pol = "0xeE071f4B516F69a1603dA393CdE8e76C40E5Be85";
const zkevm = "0x2f237e7643a3bF6Ef265dd6FCBcd26a7Cc38dbAa";
const op = "0x043f9687842771b3dF8852c1E9801DCAeED3f6bc";
const base = "0xC40DCFB13651e64C8551007aa57F9260827B6462";
const xdai = "0x2a5AEcE0bb9EfFD7608213AE1745873385515c18";
const avax = "0x17b11FF13e2d7bAb2648182dFD1f1cfa0E4C7cf3";

// BAL addresses per chain
const bal_eth = "0xba100000625a3754423978a60c9317c58a424e3D";
const bal_arb = "0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8";
const bal_pol = "0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3";
const bal_zkevm = "0x120eF59b80774F02211563834d8E3b72cb1649d6";
const bal_op = "0xFE8B128bA8C78aabC59d4c64cEE7fF28e9379921";
const bal_base = "0x4158734D47Fc9692176B5085E0F52ee0Da5d47F1";
const bal_xdai = "0x7ef541e2a22058048904fe5744f9c7e4c57af717";
const bal_avax = "0xE15bCB9E0EA69e6aB9FA080c4c4A5632896298C3";

// Token mappings per chain
const ethTokens = [
  nullAddress,
  ADDRESSES.ethereum.USDC,
  ADDRESSES.ethereum.WETH,
  ADDRESSES.ethereum.DAI,
  ADDRESSES.ethereum.GNO,
  ADDRESSES.ethereum.STETH, // stETH
  "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", // GTC
  ADDRESSES.ethereum.SAFE, // SAFE
  "0x4da27a545c0c5B758a6BA100e3a049001de870f5", // stAAVE
  ADDRESSES.ethereum.SDAI, // sDAI
  "0xc3d688B66703497DAA19211EEdff47f25384cdc3" // Compound USDC

];

const ethOwnTokens = [
  bal_eth, //BAL
  "0x2516E7B3F76294e03C42AA4c5b5b4DCE9C436fB8", // AV2-BAL-LP
  "0xcb9d0b8CfD8371143ba5A794c7218D4766c493e2" // anyBAL
];

const arbTokens = [
  ADDRESSES.arbitrum.ARB,
  ADDRESSES.arbitrum.WETH,
  ADDRESSES.arbitrum.USDC,
  ADDRESSES.arbitrum.USDC_CIRCLE
];

const arbOwnTokens = [
  bal_arb // BAL
];

const polTokens = [
  ADDRESSES.polygon.WMATIC,
  ADDRESSES.polygon.USDC,
  ADDRESSES.polygon.USDC_CIRCLE,
  ADDRESSES.polygon.USDT
];

const polOwnTokens = [
  bal_pol, //BAL
  "0x8ffDf2DE812095b1D19CB146E4c004587C0A0692", // AAVE Polygon BAL
  "0x4AA8E7d82cA4038ffC088EF15eC1679dbA050c04" // anyBAL
];

//Empty for now
const zkevmTokens = [];

const zkevmOwnTokens = [
  bal_zkevm // BAL
];

const opTokens = [];

const opOwnTokens = [
  bal_op, //BAL
  "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE", // anyBAL
  "0xc38C2fC871188935B9C615e73B17f2e7e463C8b1" // BEETS BAL-WETH BPT
];

const baseTokens = [];

const baseOwnTokens = [
  bal_base
];

const xdaiTokens = [];

const xdaiOwnTokens = [
  bal_xdai // BAL
];

const avaxTokens = [
  ADDRESSES.avax.USDC
];

const avaxOwnTokens = [
  bal_avax, //BAL
  "0xA39d8651689c8b6e5a9e0AA4362629aeF2c58F55" // 80BAL-20WAVAX BPT
];

// Keeping old code because karpatkey's api tends to break
module.exports = treasuryExports({
  ethereum: {
    owners: [eth, eth2],
    //tokens: ethTokens,
    ownTokens: ethOwnTokens
  },
  arbitrum: {
    owners: [arb],
    //tokens: arbTokens,
    ownTokens: arbOwnTokens
  },
  polygon: {
    owners: [pol],
    //tokens: polTokens,
    ownTokens: polOwnTokens
  },
  polygon_zkevm: {
    owners: [zkevm],
    //tokens: zkevmTokens,
    ownTokens: zkevmOwnTokens
  },
  optimism: {
    owners: [op],
    //tokens: opTokens,
    ownTokens: opOwnTokens
  },
  base: {
    owners: [base],
    //tokens: baseTokens,
    ownTokens: baseOwnTokens
  },
  xdai: {
    owners: [xdai],
    //tokens: xdaiTokens,
    ownTokens: xdaiOwnTokens
  },
  avax: {
    owners: [avax],
    //tokens: avaxTokens,
    ownTokens: avaxOwnTokens
  }
});

module.exports.ethereum.tvl = async (api)=>karpatKeyTvl(api, "Balancer DAO", "BAL")