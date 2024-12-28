const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { staking } = require("../helper/staking");
const { unwrapBalancerToken } = require('../helper/unwrapLPs')

const LIQUIS_BOOSTER = "0x631e58246A88c3957763e1469cb52f93BC1dDCF2"
const addresses = {
  liq: "0xD82fd4D6D62f89A1E50b1db69AD19932314aa408",
  liqLocker: "0x748A0F458B9E71061ca0aC543B984473F203E1CB",
  veLIT: "0xf17d23136B4FeAd139f54fB766c8795faae09660",
  lit80weth20: "0x9232a548DD9E81BaC65500b5e0d918F8Ba93675C",
  voterProxy: "0x37aeB332D6E57112f1BFE36923a7ee670Ee9278b",
  lens: "0xb73f303472c4fd4ff3b9f59ce0f9b13e47fbfd19",
};

async function tvl(api) {
  // Compute TVL of lps
  let pools = await api.fetchList({ target: LIQUIS_BOOSTER, itemAbi: abi.poolInfo, lengthAbi: abi.poolLength, })
  const liqPools = pools.map(pool => pool.token);
  const poolInputs = pools.map(pool => pool.lptoken);
  const poolUnis = await api.multiCall({ calls: poolInputs, abi: abi.pool, });
  const poolUpperTicks = await api.multiCall({ calls: poolInputs, abi: abi.tickUpper, });
  const poolLowerTicks = await api.multiCall({ calls: poolInputs, abi: abi.tickLower, });
  const liqBalances = await api.multiCall({ calls: liqPools, abi: 'erc20:totalSupply', });
  const bunniBalances = await api.multiCall({ calls: poolInputs, abi: 'erc20:totalSupply', });
  const calls = poolUnis.map((pool, i) => ({ params: [[pool, poolLowerTicks[i], poolUpperTicks[i]]] }))
  const res = await api.multiCall({ abi: abi.getReserves, calls, target: addresses.lens })
  let tokenCalls = []
  let reserves = res.filter((val, i) => {
    if (!(+val.reserve0 || +val.reserve1)) return; // ignore tokens without reserve
    tokenCalls.push(poolUnis[i])
    return val
  })
  let token0s = await api.multiCall({ abi: 'address:token0', calls: tokenCalls })
  let token1s = await api.multiCall({ abi: 'address:token1', calls: tokenCalls })
  reserves.forEach(({ reserve0, reserve1 }, i) => {
    const ratio = liqBalances[i] / bunniBalances[i];
    api.add(token0s[i], reserve0 * ratio)
    api.add(token1s[i], reserve1 * ratio)
  })

  // Compute veLIT locked value
  const { output: veLitTotalSupply } = await sdk.api.erc20.totalSupply({ target: addresses.veLIT, block: api.block })
  const { output: veBalance } = await sdk.api.erc20.balanceOf({ target: addresses.veLIT, owner: addresses.voterProxy, block: api.block })
  const ratio = veBalance / veLitTotalSupply
  const bal = await unwrapBalancerToken({ api, balancerToken: addresses.lit80weth20, owner: addresses.veLIT, })
  Object.entries(bal).forEach(([token, value]) => {
    api.add(token, +value * ratio, { skipChain: true, })
  })
}

module.exports = {
  methodology: "Adds up the total deposited LPs, the total veLIT owned, and the total LIT Locked.",
  ethereum: {
    tvl,
    staking: staking(addresses.liqLocker, addresses.liq)
  }
}