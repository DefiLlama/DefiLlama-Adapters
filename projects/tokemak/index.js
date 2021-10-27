const sdk = require('@defillama/sdk')
const { sumTokens, sumTokensAndLPs } = require('../helper/unwrapLPs')

const degenesisContract = "0xc803737D3E12CC4034Dde0B2457684322100Ac38"
const wethPool = "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36"
const usdcPool = "0x04bda0cf6ad025948af830e75228ed420b0e860d"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const rtoke = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930"
const toke = "0x2e9d63788249371f1dfc918a52f8d799f4a38c94"

async function tvl(timestamp, block) {
  const balances = {}
  await sumTokens(balances, [
    [weth, degenesisContract],
    [usdc, degenesisContract],
    [weth, wethPool],
    [usdc, usdcPool]
  ], block)
  return balances
}

async function staking(timestamp, block) {
  const balances = {}
  await sumTokens(balances, [
    [toke, rtoke],
  ], block)
  return balances
}

const slp = "0xd4e7a6e2d03e4e48dfc27dd3f46df1c176647e38"
const slpStaking = "0x8858a739ea1dd3d80fe577ef4e0d03e88561faa3"
const uni = "0x5fa464cefe8901d66c09b85d5fcdc55b3738c688"
const uniStaking = "0x1b429e75369ea5cd84421c1cc182cee5f3192fd3"
async function pool2(timestamp, block) {
  const balances = {}
  await sumTokensAndLPs(balances, [
    [slp, slpStaking, true],
    [uni, uniStaking, true]
  ], block)
  return balances
}

module.exports = {
  ethereum: {
    tvl,
    pool2,
    staking
  },
  tvl
}