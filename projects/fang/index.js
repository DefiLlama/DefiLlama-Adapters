const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const gfangTokenAddress = "0x6376010d9D1F64de70D9e83c4093c8294515aC28";
const fangGenesisAddress = '0xC01B68919Cd0297B1bf43E4942880E98682D3bbF'
// const gfangRewardPoolAddress = "0xe6E0A10eb298F0aC4170f2502cF7b201375BBc85";
const masonryAddress = "0x33Be17082Bd477dC804EdabBa1A8D777Da3F668d";

async function fangGenesisTVL(api) {
  const tokens = [
    ADDRESSES.robinhood.WETH, // WETH
    ADDRESSES.robinhood.USDG, // USDG
    "0x63C12667638f2Ae6fC6ae09B43D98Ec84a8586eA", // wsNET
    ADDRESSES.robinhood.NVDA, // NVDA
    "0x117cc2133c37B721F49dE2A7a74833232B3B4C0C", // SPY
    "0x2E8c31162b855A2ffa90F6F8634643Ad6F111e18", // AI
    ADDRESSES.robinhood.PONS, // PONS
    ADDRESSES.robinhood.CASHCAT, // CASHCAT
    "0x84d6BB25d3b013c784bE60dC598c920588F452bC", // fBOMB
    "0x96765066f6a040a21EB027167D2315B707c82633", // RVH
    "0x4e5195469A0360f5dfe811730C9CCaCFF0a0FeeE", // r33
    "0x5BaaeC1B70864f01dbdb747358FF59F2E2cCF7D5", // GIGA
    "0x378A50eaC56f45Fb74e4cE7F1962dbCA33515c14", // MCD
    "0x9FE4d78202F97E982546Fd5f63E2418FEf8E4ea2", // S33
    ADDRESSES.avax.USDe, // USDE
    "0xab093dEF657F15dF31b33922A95e047aDd645B29", // SHROOM
  ]

  return sumTokens2({ api, tokens, owner: fangGenesisAddress, })
}


// const pool2 = async (api) => {
//   let gauges = await api.call({ abi: 'address[]:getAllGauges', target: '0x9F59398D0a397b2EEB8a6123a6c7295cB0b0062D' })
//   let pools = await api.multiCall({ abi: 'address:stake', calls: gauges, permitFailure: true })
//   const pools2 = []
//   const gauges2 = []
//   pools.forEach((pool, i) => {
//     if (!pool) return;
//     pools2.push(pool)
//     gauges2.push(gauges[i])
//   })
//   const bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: gauges2.map(gauge => ({ target: gauge, params: gfangRewardPoolAddress })) })
//   api.add(pools2, bals)
//   return sumTokens2({ api, tokens: pools2, })
// };


module.exports = {
  methodology: "Pool2 deposits consist of FANG/USDG and GFANG/USDG LP tokens deposits while the staking TVL consists of the GFANGs tokens locked within the Masonry contract(0x33Be17082Bd477dC804EdabBa1A8D777Da3F668d).",
  hallmarks: [
    ['2025-10-14', 'Genesis Phase Started']
  ],
  robinhood: {
    tvl: fangGenesisTVL,
    // pool2,
    staking: staking(masonryAddress, gfangTokenAddress),
  },
};