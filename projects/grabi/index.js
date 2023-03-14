const sdk = require('@defillama/sdk')
const { staking } = require('../helper/staking')
const GRABI = '0x5fd71280b6385157b291b9962f22153fc9e79000'

async function tvl(_, _b, _cb, { api, }) {
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

  return balances
}

module.exports = {
  doublecounted: true,
  arbitrum: {
    tvl,
    staking: staking('0xa8d4324b1fc6442fd47414c809f4b54bfc3babc6', GRABI)
  }
}