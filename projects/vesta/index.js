const sdk = require("@defillama/sdk");
const getEntireSystemCollAbi = require("./getEntireSystemColl.abi.json");
const vestaFarmingAbi = require("./vestaFarming.abi.json");
const { sumBalancerLps, unwrapCrv } = require("../helper/unwrapLPs.js");
const { transformArbitrumAddress } = require("../helper/portedTokens");

const gOHM_ADDRESS = "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1";
const ETH_ADDRESS = "0x0000000000000000000000000000000000000000";
const renBTC_ADDRESS = "0xdbf31df14b66535af65aac99c32e9ea844e14501";

const VSTA_FARMING_ADDRESS = "0x65207da01293C692a37f59D1D9b1624F0f21177c";
const LP_VSTA_ETH_ADDRESS = "0xc61ff48f94d801c1ceface0289085197b5ec44f0";

const VST_FARMING_ADDRESS = "0xB3667b3d1b3D4ed3d451dF68C9C12A686227Bada";
const LP_VST_FRAX_ADDRESS = "0x59bF0545FCa0E5Ad48E13DA269faCD2E8C886Ba4";

const FRAX_ADDRESS = "0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F";

// TroveManager holds total system collateral (deposited ETH, renBTC, and GOHM)
const TROVE_MANAGER_ADDRESS = "0x100EC08129e0FD59959df93a8b914944A3BbD5df";

const chain = "arbitrum";

async function tvl(_, block, chainBlocks) {
  block = chainBlocks.arbitrum;

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
    ['0x0ab87046fbb341d058f17cbc4c1133f25a20a52f']: gOhmtroveTvl,
    ['0xeb4c2781e4eba804ce9a9803c67d0893436bb27d']: renBtcTroveTvl / 10 ** 10,
    ['0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2']: ethTroveTvl,
    ['0x853d955acef822db058eb8505911ed77f175b99e']: crvBal[FRAX_ADDRESS],
  };
};

async function pool2(_timestamp, block, chainBlocks) {
  const balances = {};
  const transform = await transformArbitrumAddress();
  await sumBalancerLps(
    balances,
    [[LP_VSTA_ETH_ADDRESS, VSTA_FARMING_ADDRESS]],
    chainBlocks.arbitrum,
    chain,
    transform
  );
  return balances;
};

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