const sdk = require('@defillama/sdk')
const { stakings } = require('../helper/staking')
const GARBI = '0x5fd71280b6385157b291b9962f22153fc9e79000'

async function tvl(api) {
  const balances = {}

  const singleFarms = [
    '0x12a7144114354f319bba86acd8d17e912dd4634d',
    '0x6baeb427e39da7550bff5b638686e1e39f327554',
  ]

  const farmTokens = await api.multiCall({ abi: 'address:want', calls: singleFarms })
  const farmBal = await api.multiCall({ abi: 'uint256:totalShare', calls: singleFarms })

  farmTokens.forEach((v, i) => sdk.util.sumSingleBalance(balances, v, farmBal[i], api.chain))

  const pools = [
    '0xb68b1c9a7dc9a437d6ee597ae31d80005206a919',
    '0x3d5ddde5b8790cc294d03433bbe9cad194c002a5',
    '0x4685befdc633a4067e65d422520e99c34c09b4d2',
    '0x26cf5ba5b29f23f20fa82ba684f15e1eb5bf4874',
  ]

  const base = await api.multiCall({ abi: 'address:base', calls: pools })
  const bDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: base })
  const tokens = await api.multiCall({ abi: 'address:token', calls: pools })
  const tDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: tokens })
  const reserves = await api.multiCall({ abi: 'function getTotalReserve() returns (uint256, uint256)', calls: pools })
  
  reserves.forEach(([baseBal, tokenBal], i) => {
    if (tDecimals[i] !== bDecimals[i]) {
      baseBal = baseBal / (10 ** (18 - bDecimals[i]))
      tokenBal = tokenBal / (10 ** (18 - tDecimals[i]))
    }
    sdk.util.sumSingleBalance(balances, base[i], baseBal, api.chain)
    sdk.util.sumSingleBalance(balances, tokens[i], tokenBal, api.chain)
  })
  
  const repoList = [
      '0x08E4983dA044AA8a8D3121913Ee0d368A3ff9aE4',
      '0x9E9C654ce87C0bB58D5df7835AC69A202A1deb9b',
      '0xa9D63685d81D29bF8D74c122380dF98A7C0a00a2'
  ]
  
  
  const repos = await api.multiCall({ abi: 'function getCapacityByToken() returns (uint256)', calls: repoList })
  const repoTokens = await api.multiCall({ abi: 'address:base', calls: repoList })
  const repoTokenDecimals = await api.multiCall({ abi: 'erc20:decimals', calls: repoTokens })
  
  repos.forEach((repoTokenBal, i) => {
    repoTokenBal = repoTokenBal / (10 ** (18 - repoTokenDecimals[i]));
    sdk.util.sumSingleBalance(balances, repoTokens[i], repoTokenBal, api.chain)
  })
  
  return balances
}

const stakingContracts = [
  // stakingContract1 =
  "0xa8d4324b1fc6442fd47414c809f4b54bfc3babc6",
  // stakingContract2
  "0x1fb501f09a99844e9c9b4598e50010986f6b17b2",
  // stakingContract3
  "0xfb66e862693c0676ac44e436d11c43ecda198eca"
];

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl,
    staking: stakings(stakingContracts, GARBI)
  }
}