const sdk = require("@defillama/sdk");
const { staking } = require("../helper/staking");
const constants = require("./constants");

async function balanceOf(owner, target, block) {
  const chain = "avax";
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
  const block = chainBlocks["avax"];
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
  avalanche: {
    tvl,
    staking: staking(
      "0x5857019c749147eee22b1fe63500f237f3c1b692",
      "0x22d4002028f537599be9f666d1c4fa138522f9c8",
      "avax"
    ),
  },
};
