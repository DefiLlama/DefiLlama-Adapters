const abi = require("./abi.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const masterChefContract = "0xEE7Bc7727436D839634845766f567fa354ba8C56";

async function tvl(api) {
  const infos = await api.fetchList({ lengthAbi: abi.poolLength, itemAbi: abi.poolInfo, target: masterChefContract })
  const lpTokens = infos.map(i => i.lpToken)
  const strats = infos.map(i => i.strat)
  return sumTokens2({ api, tokensAndOwners2: [lpTokens, strats], resolveLP: true })
}


module.exports = {
  bsc: { tvl, },
  methodology:
    "We count liquidity on the Strategies (Vaults) through MasterChef contracts",
};
