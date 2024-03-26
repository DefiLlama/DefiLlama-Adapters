const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("../helper/chain/starknet");
const { stakedStrkAbi } = require("./abi");

const STAKED_STRK =
  "0x04619e9ce4109590219c5263787050726be63382148538f3f936c22aa87d2fc2";
const STRK =
  ADDRESSES.starknet.STRK;

async function tvl(api) {
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
