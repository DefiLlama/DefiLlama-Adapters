
const BigNumber = require("bignumber.js");
const abi = require("./abi.json")
const { sumTokens2 } = require("../helper/unwrapLPs")

const HYPER = "0xEC73284E4EC9bcea1A7DDDf489eAA324C3F7dd31";
const THRUST = "0xE36072DD051Ce26261BF50CD966311cab62C596e";
const HYPER_THRUST = "0x569FcbDa292f1a69AB14e401bAD13Cc0E1DEC790";

const THRUST_DEPOSITOR = "0x9af27cFBe0bc537dbC47fC314934353Dad7B8919";
const BOOSTER = "0x08d46dC9E455c9B97E671b6291a54ba5668B94AC";
const VOTER_PROXY = "0x70A8075C73A9Ff9616CB5aF6BB09c04844718F27";
const LOCKER = "0xc1De2d060a18CFfAB121E90118e380629d11977E";

// https://docs.hyperlock.finance/developers/hyperlock-contracts
module.exports = {
  doublecounted: true,
  blast: {
    tvl,
  },
}

// node test.js projects/hyperlock/index.js
async function tvl(api) {

  // THRUST
  const totalSupply = await api.call({ target: HYPER_THRUST, abi: 'erc20:totalSupply' });
  api.add(THRUST, BigNumber(totalSupply));

  // HYPER in locker
  await sumTokens2({ api, owners: [LOCKER], tokens: [HYPER] });
  
  // v2 pools
  const pools = await api.fetchList({ target: BOOSTER, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, });
  pools.shift(); // remove the first pool, which is hyperTHRUST/THRUST stable pool
  await sumTokens2({ tokens: pools.map(p => p.lptoken), owners: pools.map(p => p.gauge), resolveLP: true, api});

  // v3 pools
  await sumTokens2({ api, owners: [VOTER_PROXY], resolveUniV3: true });
}