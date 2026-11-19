const ADDRESSES = require('../helper/coreAssets.json')
const { call } = require("../helper/chain/starknet");
const stakedStrk = [
  {
    name: "total_assets",
    type: "function",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u256",
      },
    ],
    state_mutability: "view",
  },
];

const stakedStrkAbi = {};
stakedStrk.forEach((i) => (stakedStrkAbi[i.name] = i));

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
  hallmarks: [['2024-03-13', "Nostra Staked STRK launch"]],
};
