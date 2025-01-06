const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

const pies_config = require("./pies.json");
const ovens = require("./ovens.json");
const tokensAndOwners = Object.values(ovens).map(i => [nullAddress, i])
tokensAndOwners.push(
  ['0xdF5096804705D135656B50b62f9ee13041253D97', '0x3A05D2394F7241e00F4ae90A1f14D9c9c48A1E9B'],
  ['0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A', '0xB9a4Bca06F14A982fcD14907D31DFACaDC8ff88E'],
  ['0xFAE2809935233d4BfE8a56c2355c4A2e7d1fFf1A', '0x8314337d2b13e1A61EadF0FD1686b2134D43762F'],
)

const pieABI = {
  "totalSupply": "uint256:totalSupply",
  "calcTokensForAmount": "function calcTokensForAmount(uint256 _amount) view returns (address[] tokens, uint256[] amounts)"
}
const pieStakingAll = {
  "poolCount": "uint256:poolCount",
  "getPoolToken": "function getPoolToken(uint256 _poolId) view returns (address)"
}

async function addPools(api) {
  const stakingC = '0x6de77A304609472A4811a0BFD47d8682Aebc29df'
  const poolTokens = await api.fetchList({  lengthAbi: pieStakingAll.poolCount, itemAbi: pieStakingAll.getPoolToken, target: stakingC})
  poolTokens.forEach(v => tokensAndOwners.push([v, stakingC]))
  return sumTokens2({ api, tokensAndOwners, resolveLP: true, })
}

async function calculatePies(api) {
  const pies = Object.values(pies_config)
  const supplies = await api.multiCall({ abi: pieABI.totalSupply, calls: pies })
  const res = await api.multiCall({ abi: pieABI.calcTokensForAmount, calls: pies.map((v, i) => ({ target: v, params: supplies[i] })) })
  res.map(({ tokens, amounts }) => api.addTokens(tokens, amounts))
}

module.exports = {
  addPools,
  calculatePies,
}
