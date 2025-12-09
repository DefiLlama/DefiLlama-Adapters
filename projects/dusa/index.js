const { queryKey, u8ArrayToString, getTokenBalances, } = require('../helper/chain/massa.js');
const { sumTokens2 } = require('../helper/unwrapLPs')

const factory1Address = 'AS1rahehbQkvtynTomfoeLmwRgymJYgktGv5xd1jybRtiJMdu8XX'
const factory2Address = "AS127Lxdux4HCUkZL89SrRYR5kq2u8t64Jt3aYj786t6fBF1cZGcu"

const getPairAddress = async (factoryAddress) => {
  const transform = val => {
    let poolAddresses = u8ArrayToString(val)
    if (poolAddresses.startsWith(":"))
      poolAddresses = poolAddresses.substring(1);

    const pools = poolAddresses.split(":");
    return pools
  }
  return (await queryKey([factoryAddress], "ALL_PAIRS", transform))[0]
}

async function tvl(api) {
  const pools1 = await getPairAddress(factory1Address)
  const pools2 = await getPairAddress(factory2Address)
  const pools = pools1.concat(pools2)
  const tokenXs = await queryKey(pools, "TOKEN_X")
  const tokenYs = await queryKey(pools, "TOKEN_Y")
  const tokenXBalances = await getTokenBalances(tokenXs, pools)
  const tokenYBalances = await getTokenBalances(tokenYs, pools)
  api.add(tokenXs, tokenXBalances)
  api.add(tokenYs, tokenYBalances)
  return sumTokens2({ api })
}

module.exports = {
  timetravel: false,
  massa: { tvl, }
};

