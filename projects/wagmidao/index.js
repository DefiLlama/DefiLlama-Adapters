const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { uniTvlExport } = require("../helper/calculateUniTvl");

const factory = "0xfe33b03a49a1fcd095a8434dd625c2d2735e84b8";
const masterChef = "0xf046e84439813bb0a26fb26944001c7bb4490771";
const stakingContract = "0xaa2c3396cc6b3dc7b857e6bf1c30eb9717066366";

const GMI = "0x8750f5651af49950b5419928fecefca7c82141e3";

const Staking = async (chainBlocks) => {
  const balances = {};

  const balance = (
    await sdk.api.abi.call({
      abi: abi.balanceOf,
      target: stakingContract,
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output;

  const balanceOf = (
    await sdk.api.abi.call({
      abi: 'erc20:balanceOf',
      target: GMI,
      params: masterChef,
      chain: "harmony",
      block: chainBlocks["harmony"],
    })
  ).output;

  sdk.util.sumSingleBalance(balances, `harmony:${GMI}`, balance);
  sdk.util.sumSingleBalance(balances, `harmony:${GMI}`, balanceOf);

  return balances;
};

module.exports = {
  harmony: {
    staking: Staking,
    tvl: sdk.util.sumChainTvls([uniTvlExport(factory, 'harmony', true),]),
  },
  methodology: "Counts liquidity on the Farms through Factory Contract, and counts Treasury as it is determined by bonding of assets. Staking refers to the staked GMI tokens",
};
