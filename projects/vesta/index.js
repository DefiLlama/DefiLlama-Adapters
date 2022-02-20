const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const vestaFarmingAbi = require("./vestaFarming.abi.json");
const BigNumber = require("bignumber.js");
const { sumBalancerLps, unwrapCrv } = require("../helper/unwrapLPs.js");

const VST_ADDRESS = "0x64343594ab9b56e99087bfa6f2335db24c2d1f17";

const gOHM_ADDRESS = "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1";
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const renBTC_ADDRESS = "0xdbf31df14b66535af65aac99c32e9ea844e14501";

// StabilityPool holds deposited VST
const STABILITY_POOL_ADDRESS_RENBTC =
  "0x3282dfAf0fBba4d3E771C4E5F669Cb4E14D8adb0";
const STABILITY_POOL_ADDRESS_ETH = "0x64cA46508ad4559E1fD94B3cf48f3164B4a77E42";
const STABILITY_POOL_ADDRESS_GOHM =
  "0x6e53D20d674C27b858a005Cf4A72CFAaf4434ECB";

const VSTA_FARMING_ADDRESS = "0x65207da01293C692a37f59D1D9b1624F0f21177c";
const LP_VSTA_ETH_ADDRESS = "0xc61ff48f94d801c1ceface0289085197b5ec44f0";

const VST_FARMING_ADDRESS = "0xB3667b3d1b3D4ed3d451dF68C9C12A686227Bada";
const LP_VST_FRAX_ADDRESS = "0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4";

// TroveManager holds total system collateral (deposited ETH, renBTC, and GOHM)
const TROVE_MANAGER_ADDRESS = "0x100EC08129e0FD59959df93a8b914944A3BbD5df";

const chain = "arbitrum";

async function tvl(_, block) {
  const renBtcStabilityPoolVST = (
    await sdk.api.erc20.balanceOf({
      target: VST_ADDRESS,
      owner: STABILITY_POOL_ADDRESS_RENBTC,
      block,
      chain,
    })
  ).output;

  const ethStabilityPoolVST = (
    await sdk.api.erc20.balanceOf({
      target: VST_ADDRESS,
      owner: STABILITY_POOL_ADDRESS_ETH,
      block,
      chain,
    })
  ).output;

  const gohmStabilityPoolVST = (
    await sdk.api.erc20.balanceOf({
      target: VST_ADDRESS,
      owner: STABILITY_POOL_ADDRESS_GOHM,
      block,
      chain,
    })
  ).output;

  const stabilityPoolTotalVST = new BigNumber(renBtcStabilityPoolVST)
    .plus(new BigNumber(ethStabilityPoolVST))
    .plus(new BigNumber(gohmStabilityPoolVST));

  const ethTroveTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      params: [ETH_ADDRESS],
      chain,
    })
  ).output;

  const renBtcTroveTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      params: [renBTC_ADDRESS],
      chain,
    })
  ).output;

  const gOhmtroveTvl = (
    await sdk.api.abi.call({
      target: TROVE_MANAGER_ADDRESS,
      abi: getEntireSystemCollAbi,
      block,
      params: [gOHM_ADDRESS],
      chain,
    })
  ).output;

  const curveBalances = (
    await sdk.api.abi.call({
      target: VST_FARMING_ADDRESS,
      abi: vestaFarmingAbi,
      block,
      params: [],
      chain,
    })
  ).output;

  const crvBal = {};
  await unwrapCrv(crvBal, LP_VST_FRAX_ADDRESS, curveBalances, block, chain);

  return {
    [VST_ADDRESS]: stabilityPoolTotalVST.toString(),
    [gOHM_ADDRESS]: gOhmtroveTvl,
    [renBTC_ADDRESS]: renBtcTroveTvl,
    [ETH_ADDRESS]: ethTroveTvl,
    ...crvBal,
  };
}

const pool2 = (_timestamp, block) =>
  sumBalancerLps(
    {},
    [[LP_VSTA_ETH_ADDRESS, VSTA_FARMING_ADDRESS]],
    block,
    "arbitrum",
    (a) => a
  );

module.exports = {
  arbitrum: {
    tvl,
    pool2,
  },
  start: 1644339600,
  timetravel: true,
  methodology:
    "Total Value Locked includes all stability pools, troves, and vst pairs",
};
