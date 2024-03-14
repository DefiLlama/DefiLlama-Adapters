const { call } = require("../helper/chain/starknet");
const { stakedStrkAbi } = require("./abi");

const STAKED_STRK =
  "0x04619e9ce4109590219c5263787050726be63382148538f3f936c22aa87d2fc2";
const STRK =
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d";

async function tvl(_, _1, _2, { api }) {
  const totalAssets = await call({
    target: STAKED_STRK,
    abi: stakedStrkAbi.total_assets,
  });
  api.addToken(STRK, totalAssets);
}

module.exports = {
  methodology:
    "The TVL is calculated as a sum of total STRK deposited into the staking contract.",
  starknet: {
    tvl,
  },
  hallmarks: [[1710349200, "Nostra Staked STRK launch"]],
};
