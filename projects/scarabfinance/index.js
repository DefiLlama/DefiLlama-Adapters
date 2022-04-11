const sdk = require("@defillama/sdk");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const scarabTokenAddress = "0x2e79205648b85485731cfe3025d66cf2d3b059c4";
const gscarabTokenAddress = "0x6ab5660f0B1f174CFA84e9977c15645e4848F5D6";
const gscarabRewardPoolAddress = "0xc88690163b10521d5fB86c2ECB293261F7771525";
const templeAddress = "0xD00F41d49900d6affd707EC6a30d1Bf7D4B7dE8F";

const ftmLPs = [
  "0x78e70eF4eE5cc72FC25A8bDA4519c45594CcD8d4", // scarabFtmLpAddress
  "0x27228140d72a7186f70ed3052c3318f2d55c404d", //gscarabFtmLpAddress
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
  return balances;
}

async function ftmPool2(timestamp, block, chainBlocks) {
  return await calcPool2(gscarabRewardPoolAddress, ftmLPs, chainBlocks.fantom, "fantom");
}

module.exports = {
  fantom: {
    tvl: async () => ({}),
    pool2: ftmPool2,
    staking: staking(templeAddress, gscarabTokenAddress, "fantom"),
  },
};