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

const bscPools = [
  // pool, token, representation

  [
    "0x0158aF415642A0879802cdb2e1347f0Af1b47eF9",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //2-Month Vault
  [
    "0x1240F9904c02d7e48FF03a7C71894bF2530838EB",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //4-Month Vault
  [
    "0x50D888179581D540753Aa6E2B6fe5EDCa594158a",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //6-Month Vault
  [
    "0xB634a7f635C6367C7F07485363750C09184Fd3F4",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //3-Month Vault
  [
    "0x45994757C035892AE66b91925a4Cf561D6aa66f6",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //5-Month Vault
  [
    "0x1b5A0D734786ef666abCDfD4153f3EaB9062a1F8",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //4-Month Vest Vault
  [
    "0x1386FdB83a0Ce87E146E8BCF807F2B969D29A97a",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //6-Month Vest Vault
  [
    "0x3a154b615447CD79D5617CD864d693e9CdD95685",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //12-Month Vest Vault
  [
    "0x44D86d4DE4bAe10c85Da7C7D2CDC3333b4b515C8",
    "0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
    "bsc:0xde3dbbe30cfa9f437b293294d1fd64b26045c71a",
  ], //Tiers
  [
    "0xC5d72B45C09d2509e66F78D19BfA3B5DD7C04f5a",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
    "bsc:0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //6-Month LOTT Vault
  [
    "0x3213F00f2aa67BdC6eCF1502C99cCA044C87690F",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
    "bsc:0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //3-Month LOTT Vault
  [
    "0x3746ff9590A1ca9bC9a2067481324a75d3C528Ef",
    "0xf81628edeb110a73c016ab7afa57d80afae07f59",
    "bsc:0xf81628edeb110a73c016ab7afa57d80afae07f59",
  ], //1-Month LOTT Vault
];

async function bsc(_timestamp, block, chainBlocks) {
  return getTotal(bscPools, "bsc", chainBlocks["bsc"]);
}

function mergeBalances(balances, balancesToMerge) {
  Object.entries(balancesToMerge).forEach((balance) => {
    sdk.util.sumSingleBalance(balances, balance[0], balance[1]);
  });
}
async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  await Promise.all([bsc(timestamp, block, chainBlocks)]).then((poolBalances) =>
    poolBalances.forEach((pool) => mergeBalances(balances, pool))
  );
  return balances;
}

module.exports = {
  bsc: {
    tvl: bsc,
  },
  tvl,
};
