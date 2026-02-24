
const { sumTokens2 } = require("../helper/unwrapLPs")
const { staking } = require('../helper/staking')

const HYPER = "0xEC73284E4EC9bcea1A7DDDf489eAA324C3F7dd31";
const THRUST = "0xE36072DD051Ce26261BF50CD966311cab62C596e";
const HYPER_THRUST = "0x569FcbDa292f1a69AB14e401bAD13Cc0E1DEC790";

const BOOSTER = "0x08d46dC9E455c9B97E671b6291a54ba5668B94AC";
const VOTER_PROXY = "0x70A8075C73A9Ff9616CB5aF6BB09c04844718F27";
const LOCKER = "0xc1De2d060a18CFfAB121E90118e380629d11977E";

const abi = {
  "poolLength": "uint256:poolLength",
  "poolInfo": "function poolInfo(uint256) view returns (address lptoken, address token, address gauge, address crvRewards, address stash, bool shutdown)"
}

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl,
    staking: staking(LOCKER, HYPER)
  },
}

// node test.js projects/hyperlock/index.js
async function tvl(api) {

  // THRUST
  const totalSupply = await api.call({ target: HYPER_THRUST, abi: 'erc20:totalSupply' });
  api.add(THRUST, totalSupply);

  // v2 pools
  const pools = await api.fetchList({ target: BOOSTER, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, });
  pools.shift(); // remove the first pool, which is hyperTHRUST/THRUST stable pool
  const tokensAndOwners = pools.map(p => [p.lptoken, p.gauge]);
  await sumTokens2({ tokensAndOwners, resolveLP: true, api});

  // v3 pools
  await sumTokens2({ api, owners: [VOTER_PROXY], resolveUniV3: true });
}