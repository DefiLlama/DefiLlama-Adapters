const sdk = require("@defillama/sdk");
const { getChainTvl } = require("./helper/getUniSubgraphTvl");
const { getBlock } = require("./helper/getBlock");
const { default: BigNumber } = require("bignumber.js");
const { calculateUsdUniTvl } = require("./helper/getUsdUniTvl");
const { staking, stakings } = require("./helper/staking");

const masterChefV1 = "0x9984d70D5Ab32E8e552974A5A24661BFEfE81DbE";
const masterChefV2 = "0x1c9F36FE608190D1fe99e001b596c31871696b24";
const AVAX = "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7";

const stakingConttract_xhctBar = "0x75B797a0ed87F77bB546F3A3556F18fC35a01140";
const stakingConttract_shctBar = "0xE4aE2E8648B8E84c4A487a559b04e884B822a350";
const HCT = "0x45C13620B55C35A5f539d26E88247011Eb10fDbd";

const chainTvl = calculateUsdUniTvl(
  "0x7009b3619d5ee60d0665BA27Cf85eDF95fd8Ad01",
  "avax",
  "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
  [
    "0x45c13620b55c35a5f539d26e88247011eb10fdbd", //hct
    "0xc7198437980c041c805a1edcba50c1ce5db95118", //usdte
    "0xfbbc6be26e1712685848b7194365600513cf73ca", //ausdt
    "0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", //weth
    "0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", //usdce
    "0x7ed05cf8f77fb75a10947e0715c0876e074ff676", //acake
    "0x50b7545627a5162f82a992c33b87adc75187b218", //wbtc
    "0x60781c2586d68229fde47564546784ab3faca982", //png
    "0x5947bb275c521040051d82396192181b413227a3", //link
  ],
  "wrapped-avax"
);

/*
const graphUrls = {
  avax: 'https://api.thegraph.com/subgraphs/name/hurricaneswap/exchange-v2',
}
const chainTvl = getChainTvl(graphUrls, "pancakeFactories")("avax")
*/

module.exports = {
  timetravel: true,
  doublecounted: false,
  misrepresentedTokens: true,
  avax: {
    tvl: sdk.util.sumChainTvls([chainTvl, staking(masterChefV2, AVAX, "avax")]),
    staking: stakings(
      [
        stakingConttract_xhctBar,
        stakingConttract_shctBar,
        masterChefV2,
        masterChefV1,
      ],
      HCT,
      "avax"
    ),
  },
  methodology:
    'We count TVL from the "0x7009b3619d5ee60d0665BA27Cf85eDF95fd8Ad01" factory address, which includes all pairs data of HurricaneSwap. The staking portion includes the liquidity in the HCTBar (xHCT), StakingReward (sHCT) contract and the WAVAX deposited in pool contract.',
};
