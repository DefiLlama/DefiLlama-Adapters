const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const constants = require("./constants");

async function balanceOf(owner, target, block) {
  const chain = "polygon";
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
  const block = chainBlocks["polygon"];
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
  polygon:{
    tvl,
    staking: staking(
      "0xfD5D4caDe98366d0b09c03cB3cEe7D244c8b6146", //ve
      "0xE0f463832295ADf63eB6CA053413a3f9cd8bf685", //snow
      "polygon"
    ),
  },
};
