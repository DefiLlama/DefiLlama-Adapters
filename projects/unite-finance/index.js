const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");
const { fixHarmonyBalances } = require("../helper/portedTokens");

const uniteTokenAddress = "0xB4441013EA8aA3a9E35c5ACa2B037e577948C59e";
const ushareTokenAddress = "0xd0105cff72a89f6ff0bd47e1209bf4bdfb9dea8a";
const ushareRewardPoolAddress = "0xe3F4E2936F0Ac4104Bd6a58bEbd29e49437710Fe";
const boardroomAddress = "0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd";

const OneLPs = [
  "0xa0377f9fd3de5dfefec34ae4807e9f2b9c56d534", // uniteOneLpAddress
  "0x6372d14d29f07173f4e51bb664a4342b4a4da9e8", //ushareOneLpAddress
];

async function calcPool2(masterchef, lps, block, chain) {
  let balances = {};
  const lpBalances = (
    await sdk.api.abi.multiCall({
      calls: lps.map((p) => ({
        target: p,
        params: masterchef,
      })),
      abi: "erc20:balanceOf",
      block,
      chain,
    })
  ).output;
  let lpPositions = [];
  lpBalances.forEach((p) => {
    lpPositions.push({
      balance: p.output,
      token: p.input.target,
    });
  });
  await unwrapUniswapLPs(
    balances,
    lpPositions,
    block,
    chain,
    (addr) => `${chain}:${addr}`
  );
  fixHarmonyBalances(balances);
  return balances;
}

async function OnePool2(timestamp, block, chainBlocks) {
  return await calcPool2(ushareRewardPoolAddress, OneLPs, chainBlocks.harmony, "harmony");
}

module.exports = {
  methodology: "Pool2 deposits consist of UNITE/ONE and USHARE/ONE LP tokens deposits while the staking TVL consists of the TSHARES tokens locked within the Boardroom contract(0x68BeEc29183464e2C80Aa9B362db8b0c0eB826bd).",
  harmony: {
    tvl: async () => ({}),
    pool2: OnePool2,
    staking: staking(boardroomAddress, ushareTokenAddress, "harmony"),
  },
};