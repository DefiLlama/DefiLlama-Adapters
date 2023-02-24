const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { sumTokens2, nullAddress } = require("../helper/unwrapLPs");
const { getChainTransform, getFixBalances } = require("../helper/portedTokens");

const tcro = "0xeAdf7c01DA7E93FdB5f16B0aa9ee85f978e89E95";

const markets = [
  '0x543F4Db9BD26C9Eb6aD4DD1C33522c966C625774',  // WETH
  '0x67fD498E94d95972a4A2a44AccE00a000AF7Fe00',  // WBTC
  '0xB3bbf1bE947b245Aef26e3B6a9D777d7703F4c8e',  // USDC
  '0xA683fdfD9286eeDfeA81CF6dA14703DA683c44E5',  // USDT
  '0xE1c4c56f772686909c28C319079D41adFD6ec89b',  // DAI
  '0x4bD41f188f6A05F02b46BB2a1f8ba776e528F9D2',  // TUSD
  '0xfe6934FDf050854749945921fAA83191Bccf20Ad',  // TONIC
]

const chain = 'cronos'
async function tvl(ts, _, { [chain]: block }) {
  const calls = markets.map(i => ({ target: i }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.underlying,
    calls, chain, block,
  })
  const toa = tokens.map(i => ([i.output, i.input.target]))
  toa.push([nullAddress, tcro])
  return sumTokens2({ tokensAndOwners: toa, chain, block, })
}

async function borrowed(timestamp, block, chainBlocks) {
  block = chainBlocks[chain]
  const transform = await getChainTransform(chain)
  const fixBlances = await getFixBalances(chain)
  const calls = [...markets, tcro].map(i => ({ target: i }))
  const { output: tokens } = await sdk.api.abi.multiCall({
    abi: abi.underlying,
    calls: markets.map(i => ({ target: i })), chain, block,
  })
  const { output: borrowed } = await sdk.api.abi.multiCall({
    abi: abi.totalBorrows,
    calls, chain, block,
  })
  const balances = {}
  tokens.forEach((data, i) => {
    sdk.util.sumSingleBalance(balances, transform(data.output), borrowed[i].output)
  })
  sdk.util.sumSingleBalance(balances, transform(nullAddress), borrowed[markets.length].output)
  fixBlances(balances)
  return balances
}

module.exports = {
  cronos: {
    tvl,
    borrowed,
  },
};
