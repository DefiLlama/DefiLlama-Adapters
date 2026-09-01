const { sumTokens2, nullAddress } = require('../helper/unwrapLPs');

const pies_config = {
  "BTC++": "0x0327112423f3a68efdf1fcf402f6c5cb9f7c33fd",
  "USD++": "0x9a48bd0ec040ea4f1d3147c025cd4076a2e71e3e",      
  "DEFI+S": "0xad6a626ae2b43dcb1b39430ce496d2fa0365ba9c",
  "DEFI+L": "0x78f225869c08d478c34e5f645d07a87d3fe8eb78",
  "DEFI++": "0x8D1ce361eb68e9E05573443C407D4A3Bed23B033",
  "BCP": "0xe4f726adc8e89c6a6017f01eada77865db22da14",
  "YPIE": "0x17525E4f4Af59fbc29551bC4eCe6AB60Ed49CE31",
  "PLAY": "0x33e18a092a93ff21ad04746c7da12e35d34dc7c4"
};
const ovens = {
  "PLAY": "0x0c4Ff8982C66cD29eA7eA96d985f36aE60b85B1C",
  "DEFI++": "0x1d616dad84dd0b3ce83e5fe518e90617c7ae3915",
  "BCP": "0xe3d74df89163a8fa1cba540ff6b339d13d322f61",
  "YPIE": "0xAedec86DeDe3DEd9562FB00AdA623c0e9bEEb951"
};
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
const { staking } = require('../helper/staking')

async function tvl(api) {
    await Promise.all([
        addPools(api),
        calculatePies(api),
    ])
}

module.exports = {
    ethereum: {
        staking: staking("0x6Bd0D8c8aD8D3F1f97810d5Cc57E9296db73DC45", "0xad32A8e6220741182940c5aBF610bDE99E737b2D"),
        tvl
    }
}
