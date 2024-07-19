const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("../helper/chain/starknet");
const { stakedStrkAbi } = require("./abi");

const STAKED_STRK =
  ADDRESSES.starknet.NSTSTRK;
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
