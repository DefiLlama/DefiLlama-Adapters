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

// Innovation Pool
const Asset_P07_BUSD = "0xcf434949c242c2d32514ba971947bd3700efb015";
const Asset_P07_FRAX = "0x47ab513f97e1cc7d7d1a4db4563f1a0fa5c371eb";
const Asset_P07_TUSD = "0x3c8e744f6c4ed2c9d82e33d69ddcc5961aa05367";

// BNBx Pool
const Asset_P08_WBNB = "0x0321d1d769cc1e81ba21a157992b635363740f86";
const Asset_P08_BNBx = "0x16b37225889a038fad42efded462821224a509a7";

// stkBNB Pool
const Asset_P09_WBNB = "0x6C7B407411b3DB90DfA25DA4aA66605438D378CE";
const Asset_P09_stkBNB = "0x0E202A0bCad2712d1fdeEB94Ec98C58bEeD0679f";

// iUSD Pool
const Asset_P10_BUSD = "0x7Ff1AEc17ea060BBcB7dF6b8723F6Ea7fc905E8F";
const Asset_P10_iUSD = "0x3A29dF144bB54A8bF3d20357c116befa7adE962d";

// CUSD Pool
const Asset_P11_CUSD = "0x3ac762C607ed6Dba156cBcF11efF96340e86b490";
const Asset_P11_HAY = "0xa6eF6C45EbFDBc13f6D032fbDFeC9b389C1603E5";

// axlUSDC Pool
const Asset_P12_axlUSDC = "0x77F645Ee0c6d47380A942B04B8151fD542927391";
const Asset_P12_BUSD = "0x791b2424df9865994Ad570425278902E2B5D7946";

// USDD Pool
const Asset_P13_USDD = "0x24a70c1489d521F5e2D2612474630eFe7C2ba073";
const Asset_P13_USDC = "0x9F9CeA30d242d7f5527Fa900f9fb0F77A98FdA82";

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
const FRAX = "0x90C97F71E18723b0Cf0dfa30ee176Ab653E89F40";
const TUSD = "0x14016E85a25aeb13065688cAFB43044C2ef86784";
const CUSD = "0xfa4ba88cf97e282c505bea095297786c16070129";
const iUSD = "0x0A3BB08b3a15A19b4De82F8AcFc862606FB69A2D";
const axlUSDC = "0x4268B8F0B87b6Eae5d897996E6b845ddbD99Adf3";
const USDD = "0xd17479997F34dd9156Deef8F95A52D81D265be9c";
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
    [BUSD, Asset_P07_BUSD],
    [FRAX, Asset_P07_FRAX],
    [TUSD, Asset_P07_TUSD],
    [WBNB, Asset_P08_WBNB],
    [BNBx, Asset_P08_BNBx],
    [WBNB, Asset_P09_WBNB],
    [stkBNB, Asset_P09_stkBNB],
    [BUSD, Asset_P10_BUSD],
    [iUSD, Asset_P10_iUSD],
    [CUSD, Asset_P11_CUSD],
    [HAY, Asset_P11_HAY],
    [axlUSDC, Asset_P12_axlUSDC],
    [BUSD, Asset_P12_BUSD],
    [USDD, Asset_P13_USDD],
    [USDC, Asset_P13_USDC],
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
