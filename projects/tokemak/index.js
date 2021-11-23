const sdk = require('@defillama/sdk')
const { sumTokens, sumTokensAndLPs } = require('../helper/unwrapLPs')

const degenesisContract = "0xc803737D3E12CC4034Dde0B2457684322100Ac38"
const wethPool = "0xD3D13a578a53685B4ac36A1Bab31912D2B2A2F36"
const usdcPool = "0x04bda0cf6ad025948af830e75228ed420b0e860d"
const usdc = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const ohmPool = "0xe7a7D17e2177f66D035d9D50A7f48d8D8E31532D";
const ohm = "0x383518188C0C6d7730D91b2c03a03C837814a899";
const alcxPool = "0xD3B5D9a561c293Fb42b446FE7e237DaA9BF9AA84";
const alcx = "0xdBdb4d16EdA451D0503b854CF79D55697F90c8DF";
const fxsPool = "0xADF15Ec41689fc5b6DcA0db7c53c9bFE7981E655";
const fxs = "0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0";
const tcrPool = "0x15A629f0665A3Eb97D7aE9A7ce7ABF73AeB79415";
const tcr = "0x9C4A4204B79dd291D6b6571C5BE8BbcD0622F050";
const rtoke = "0xa760e26aA76747020171fCF8BdA108dFdE8Eb930"
const toke = "0x2e9d63788249371f1dfc918a52f8d799f4a38c94"
const sushiPool = "0xf49764c9C5d644ece6aE2d18Ffd9F1E902629777";
const sushi = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2";

async function tvl(timestamp, block) {
  const balances = {}
  await sumTokens(balances, [
    [weth, degenesisContract],
    [usdc, degenesisContract],
    [weth, wethPool],
    [usdc, usdcPool],
    [ohm, ohmPool],
    [alcx, alcxPool],
    [fxs, fxsPool],
    [tcr, tcrPool],
    [sushi, sushiPool]
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