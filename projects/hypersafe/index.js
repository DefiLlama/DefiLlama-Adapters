const {sumTokens2, nullAddress} = require("../helper/unwrapLPs");

async function tvl(api) {
  const tokens = await api.call({
    target: "0x5534C7Fc1faF7b87ca58fEdA22cC8be47A2F2B44",
    abi: "function getAllTokens() returns (address[])",
  })
  
  await sumTokens2({ api, owners: tokens, token: nullAddress })
}

module.exports = {
  methodology:
    "TVL is the sum of all ETH held in bonding curve token contracts deployed via the HyperSafe TokenFactory on Base. Each token contract holds ETH proportional to tokens purchased along its bonding curve.",
  start: "2026-03-10",
  base: {
    tvl,
  },
};