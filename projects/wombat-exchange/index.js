const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const { sumTokens2 } = require("../helper/unwrapLPs");

// Wombat Asset Address
// Main Pool
const Asset_P01_BUSD = "0xF319947eCe3823b790dd87b0A509396fE325745a";
const Asset_P01_DAI = "0x9d0a463d5dcb82008e86bf506eb048708a15dd84";
const Asset_P01_USDC = "0xb43ee2863370a56d3b7743edcd8407259100b8e2";
const Asset_P01_USDT = "0x4f95fe57bea74b7f642cf9c097311959b9b988f7";

// BNB Pool
const Asset_P02_WBNB = "0x74f019a5c4ed2c2950ce16fad7af838549092c5b";
const Asset_P02_BNBx = "0x10f7c62f47f19e3ce08fef38f74e3c0bb31fc24f";
const Asset_P02_aBNBc = "0x9d2dead9547eb65aa78e239647a0c783f296406b";
const Asset_P02_stkBNB = "0xc496f42ea6fc72af434f48469b847a469fe0d17f";

// Side Pool
const Asset_P03_BUSD = "0xa649be04619a8f3b3475498e1ac15c90c9661c1a";
const Asset_P03_HAY = "0x1fa71df4b344ffa5755726ea7a9a56fbbee0d38b";

// wmxWom Pool
const Asset_P04_WOM = "0xf9bdc872d75f76b946e0770f96851b1f2f653cac";
const Asset_P04_wmxWOM = "0x3c42e4f84573ab8c88c8e479b7dc38a7e678d688";

// mWOM Pool
const Asset_P05_WOM = "0xEABa290B154aF45DE72FDf2a40E56349e4E68AC2";
const Asset_P05_mWOM = "0x1f502fF26dB12F8e41B373f36Dc0ABf2D7F6723E";

// qWOM Pool
const Asset_P06_WOM = "0xB5c9368545A26b91d5f7340205e5d9559f48Bcf8";
const Asset_P06_qWOM = "0x87073ba87517E7ca981AaE3636754bCA95C120E4";

// underlyingToken Address
const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const DAI = "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const WBNB = "0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c";
const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
const aBNBc = "0xe85afccdafbe7f2b096f268e31cce3da8da2990a";
const stkBNB = "0xc2e9d07f66a89c44062459a47a0d2dc038e4fb16";
const HAY = "0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5";
const WOM = "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1";
const wmxWOM = "0x0415023846Ff1C6016c4d9621de12b24B2402979";
const mWOM = "0x027a9d301fb747cd972cfb29a63f3bda551dfc5c";
const qWOM = "0x0fE34B8aaAf3f522A6088E278936D10F934c0b19";
const chain = "bsc";

async function tvl(_t, _, { bsc: block }) {
  const toa = [
    [BUSD, Asset_P01_BUSD],
    [BUSD, Asset_P03_BUSD],
    [DAI, Asset_P01_DAI],
    [USDC, Asset_P01_USDC],
    [USDT, Asset_P01_USDT],
    [WBNB, Asset_P02_WBNB],
    [BNBx, Asset_P02_BNBx],
    [aBNBc, Asset_P02_aBNBc],
    [stkBNB, Asset_P02_stkBNB],
    [HAY, Asset_P03_HAY],
    [WOM, Asset_P04_WOM],
    [wmxWOM, Asset_P04_wmxWOM],
    [WOM, Asset_P05_WOM],
    [mWOM, Asset_P05_mWOM],
    [WOM, Asset_P06_WOM],
    [qWOM, Asset_P06_qWOM],
  ];
  let balances = await sumTokens2({ tokensAndOwners: toa, chain, block });

  return balances;
}

module.exports = {
  bsc: {
    tvl,
    staking: staking(
      "0x3DA62816dD31c56D9CdF22C6771ddb892cB5b0Cc",
      "0xAD6742A35fB341A9Cc6ad674738Dd8da98b94Fb1",
      "bsc"
    ),
  },
  hallmarks: [
    [1662417125, "Liquidity Mining Start"],
    [1663120800, "Staking Pool Start"],
    [1663725600, "Side Pool Start"],
  ],
};
