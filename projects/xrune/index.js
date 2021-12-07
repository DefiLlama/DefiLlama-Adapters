const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const BN = require("bignumber.js");

async function getTotal(pools, chain, block) {
  const balances = {};
  // Need to be called separately because BUSDT rejects when multicalled on BSC
  await Promise.all(
    pools.map((pool) =>
      sdk.api.erc20
        .balanceOf({
          target: pool[1],
          owner: pool[0],
          chain,
          block,
        })
        .then((result) =>
          sdk.util.sumSingleBalance(balances, pool[2], result.output)
        )
    )
  );
  return balances;
}

const ethPools = [
  // pool, currency
  [
    "0x2a092e401507dD4877cCd0b4Ee70B769452DbB7a",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //2-Month Vault
  [
    "0xc20434f595c32B5297A737Cb173382Dd2485C2cC",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //4-Month Vault
  [
    "0x8ba0C510Da4507D1F5f73ff9E1FcD14Edc819EB2",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //6-Month Vault
  [
    "0x817ba0ecafD58460bC215316a7831220BFF11C80",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
    "0x69fa0feE221AD11012BAb0FdB45d444D3D2Ce71c",
  ], //Tiers
];

async function eth(_timestamp, block, chainBlocks) {
  return getTotal(ethPools, "ethereum", block);
}

function mergeBalances(balances, balancesToMerge) {
  Object.entries(balancesToMerge).forEach((balance) => {
    sdk.util.sumSingleBalance(balances, balance[0], balance[1]);
  });
}

async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await Promise.all([eth(timestamp, block, chainBlocks)]).then((poolBalances) =>
    poolBalances.forEach((pool) => mergeBalances(balances, pool))
  );
  return balances;
}

module.exports = {
  ethereum: {
    tvl: eth,
  },
  tvl,
};
