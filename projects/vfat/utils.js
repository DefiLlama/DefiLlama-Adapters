const { Balances } = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

async function sumLPBalances(api, gauges, sickles, lpTokens) {
  api.log(api.chain, sickles.length, gauges.length,)
  lpTokens.forEach((lpToken, index) => lpTokens[index] = lpToken.toLowerCase())
  let minLPValue = 4e3
  if (lpTokens.length > 200) minLPValue = 15e3
  if (lpTokens.length > 400) minLPValue = 40e3

  const filteredLPSet = new Set(await filteredLPTokens({ api, lpTokens, minLPValue, }))

  const gaugeTokenMapping = {};
  const tokens = []
  lpTokens.forEach((lpToken, index) => {
    if (!filteredLPSet.has(lpToken)) return;

    const gauge = gauges[index].toLowerCase()
    tokens.push(gauge)
    gaugeTokenMapping[gauge] = lpToken
  });

  const transformAddress = (token) => {
    token = token.toLowerCase()
    return `${api.chain}:${gaugeTokenMapping[token] ?? token}`
  }
  await sumTokens2({ api, transformAddress, tokens, owners: sickles, sumChunkSize: 10000, })
}

// we are going to filter out tokens that we dont have price in the server and LP tokens with less than 1k value in it
async function filteredLPTokens({ api, lpTokens, minLPValue = 10e3 }) {
  const token0s = await api.multiCall({ abi: 'address:token0', calls: lpTokens, permitFailure: true, })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: lpTokens, permitFailure: true, })
  const reserves = await api.multiCall({ abi: 'function getReserves() view returns (uint256 bal0, uint256 bal1,  uint256 block)', calls: lpTokens, permitFailure: true, })
  const allTokens = [lpTokens, token0s, token1s,].flat().filter(i => i).map(i => i.toLowerCase())
  const dummyBals = {}
  allTokens.forEach(i => dummyBals[api.chain + ':' + i] = 1e20) // hack to cache token prices to memory
  await Balances.getUSDValue(dummyBals)

  const filteredLPTokens = []
  for (let i = 0; i < lpTokens.length; i++) {
    const tokenBalance = new Balances({ chain: api.chain, })
    tokenBalance.add(lpTokens[i], 1e20)
    const tokenValue = await tokenBalance.getUSDValue()
    if (tokenValue > 0) {
      filteredLPTokens.push(lpTokens[i])
      continue;
    }

    if (!reserves[i]) {
      continue;
    }


    const lpBalance = new Balances({ chain: api.chain, })
    lpBalance.add(token0s[i], reserves[i].bal0)
    lpBalance.add(token1s[i], reserves[i].bal1)
    const lpValue = await lpBalance.getUSDValue()
    if (lpValue < minLPValue) { // LP has less than 2k value, we ignore it
      continue;
    }
    filteredLPTokens.push(lpTokens[i])
  }

  api.log(api.chain, 'filteredLPTokens', filteredLPTokens.length, 'out of', lpTokens.length, 'LP tokens are filtered out.')
  return filteredLPTokens
}


// we are going to filter out tokens that we dont have price in the server and LP tokens with less than 1k value in it
async function filteredV3LPTokens({ api, lpTokens, minLPValue = 10e3 }) {
  const token0s = await api.multiCall({ abi: 'address:token0', calls: lpTokens, permitFailure: true, })
  const token1s = await api.multiCall({ abi: 'address:token1', calls: lpTokens, permitFailure: true, })
  const tok1n0Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: lpTokens.map((i, idx) => ({ target: token0s[idx], params: i})), permitFailure: true, })
  const tok1n1Bals = await api.multiCall({ abi: 'erc20:balanceOf', calls: lpTokens.map((i, idx) => ({ target: token1s[idx], params: i})), permitFailure: true, })
  const allTokens = [token0s, token1s,].flat().filter(i => i).map(i => i.toLowerCase())
  const dummyBals = {}
  allTokens.forEach(i => dummyBals[api.chain + ':' + i] = 1e20) // hack to cache token prices to memory
  await Balances.getUSDValue(dummyBals)

  const filteredLPTokens = []
  for (let i = 0; i < lpTokens.length; i++) {
    const lpBalance = new Balances({ chain: api.chain, })
    lpBalance.add(token0s[i], tok1n0Bals[i] ?? 0)
    lpBalance.add(token1s[i], tok1n1Bals[i] ?? 0)
    const lpValue = await lpBalance.getUSDValue()
    if (lpValue < minLPValue) { // LP has less than 2k value, we ignore it
      continue;
    }
    filteredLPTokens.push(lpTokens[i])
  }

  api.log(api.chain, 'filteredLPTokens', filteredLPTokens.length, 'out of', lpTokens.length, 'LP tokens are filtered out.')
  return filteredLPTokens
}


module.exports = {
  sumLPBalances,
  filteredV3LPTokens,
}