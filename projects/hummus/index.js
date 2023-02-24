const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const constants = require("./constants");

async function balanceOf(owner, target, block) {
  const chain = "metis";
  let decimals = (await sdk.api.erc20.decimals(target, chain)).output;
  let balance = (
    await sdk.api.erc20.balanceOf({
      owner,
      target,
      block,
      chain,
    })
  ).output;
  return Number(balance) / 10 ** decimals;
}

async function tvl(timestamp, ethereumBlock, chainBlocks) {
  const block = chainBlocks["metis"];
  let balances = {};

  for (const key in constants) {
    const { id, addresses } = constants[key];
    let totalBalance = 0;
    for (const { token, lpTokens } of addresses) {
      for (const lpToken of lpTokens) {
        totalBalance += await balanceOf(lpToken, token, block);
      }
    }
    balances[id] = totalBalance;
  }

  return balances;
}

module.exports = {
  metis: {
    tvl,
    staking: staking(
      "0x89351BEAA4AbbA563710864051a8C253E7b3E16d", // veHUM
      "0x4aAC94985cD83be30164DfE7e9AF7C054D7d2121", // HUM
      "metis"
    ),
  },
};
