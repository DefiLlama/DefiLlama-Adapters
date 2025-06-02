const engine_weth_usdc = '0xd3541aD19C9523c268eDe8792310867C57BE39e4' // WETH-USDC Pair
const engines = [engine_weth_usdc]

module.exports = async function tvl(api) {
  const risky = await api.multiCall({  abi: 'address:risky', calls: engines})
  const stable = await api.multiCall({  abi: 'address:stable', calls: engines})
  const toa = []
  risky.forEach((v, i) => toa.push([v, engines[i]]))
  stable.forEach((v, i) => toa.push([v, engines[i]]))
  return api.sumTokens({ tokensAndOwners: toa })
}