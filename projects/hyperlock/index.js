
const abi = require("./abi.json")
const { sumTokens2 } = require("../helper/unwrapLPs")

const BOOSTER = "0x08d46dC9E455c9B97E671b6291a54ba5668B94AC";
const VOTER_PROXY = "0x70A8075C73A9Ff9616CB5aF6BB09c04844718F27";

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl,
  },
}


async function tvl(api) {
  const pools = await api.fetchList({ target: BOOSTER, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, })
  pools.shift(); // remove the first pool, which is hyperTHRUST/THRUST stable pool
  await sumTokens2({ tokens: pools.map(p => p.lptoken), owners: pools.map(p => p.gauge), resolveLP: true, api});
  return sumTokens2({ api, owners: [VOTER_PROXY], resolveUniV3: true });
}