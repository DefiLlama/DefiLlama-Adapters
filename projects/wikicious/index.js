const { sumTokensExport } = require("../helper/sumTokens");
const ADDRESSES = require("../helper/coreAssets.json")

const WikiStaking       = "0xDD551D705fAbD4380D2C95F7345b671cE3310bd2";
const WikiLiquidStaking = "0x6ac54F360315E0B3Dae455ad371A06d154b410B2";
const WikiGaugeVoting   = "0x016886FF6fdab890Dd03aE7a1D6535ef57f06F92";
const WIK = "0xa681Bf6f0449ABc4E98DCa3468488Fe1b24FdD0F";

const contracts = [
  "0x4533E181FdF5b0C66e0816992F38c23d57e42Df8", // WikiVault
  "0x723f653a3DEFC45FB934BBF81f1411883a977468", // WikiPerp
  "0x9C63c27B8A73A990a2D89141622A639a2363b88A", // WikiVirtualAMM
  "0x5e73fa11c2Fa157dbE59E7B8F7f1b3101c5c6004", // WikiAMM
  "0x95F3Cf765b479478c44D0EE932f17444ADA6A9a1", // WikiYieldAggregator
  "0xf2cD47C16CCA38aC77e6ab344E04e7E97C400748", // WikiBackstopVault
  "0x8897A8Ae133b0DD71ef6E28B1A8efB42f1Ef78d4", // WikiFundingArbVault
  "0x53b6A9bE66C68090c26d4BE74f6eB916578F3A0B", // WikiIdleYieldRouter
  "0x74635CFa33EEAe220367fF10C598e098a29e9246", // WikiLending
  "0x9e09dF7E84aBf818882a259Ef897a55f25CE1163", // WikiCopyTrading
  "0xE019e13abdd7160f8467D55E3e190022295dEdc1", // WikiOptionsVault
  "0x42DB4776FFB45f2cc5663407e7953935f63fd40E", // WikiLaunchpad
  "0x08FC8f870Df09A7265D1D06a7A95C41cEf98d9E6", // WikiSpot
];

const TOKENS = [
  ADDRESSES.arbitrum.USDC_CIRCLE,
  ADDRESSES.arbitrum.WETH,
  ADDRESSES.arbitrum.WBTC,
  ADDRESSES.arbitrum.ARB,
  ADDRESSES.arbitrum.USDT,
  ADDRESSES.arbitrum.WSTETH,
  '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8', // rETH
];

module.exports = {
  methodology:
    "TVL counts all tokens deposited into protocol contracts on Arbitrum One.",
  arbitrum: {
    tvl: sumTokensExport({ tokens: TOKENS, owners: contracts }),
    staking: sumTokensExport({ tokens: [WIK], owners: [WikiStaking, WikiLiquidStaking, WikiGaugeVoting] }),
  },
};
