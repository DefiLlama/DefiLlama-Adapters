const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens, } = require('../helper/unwrapLPs')

const chain = 'bsc'

const DEPOSIT_TOKENS = [
  ADDRESSES.bsc.WBNB, // wBnB
  ADDRESSES.bsc.ETH, //ETH,
  ADDRESSES.bsc.USDT, // USDT
  ADDRESSES.bsc.BTCB, // BTC
]

const DEPOSIT_CONTRACT = '0xe94286A3e83D66aB3bAF9840184a2E5680e9A7eC'
const BANK_ADDRESS = '0x86D21a8183e150e5050ba5DFd53535b6dE100435'

async function tvl(timestamp, ethBlock, chainBlocks) {
  const balances = {}

  const block = chainBlocks[chain]
  const tokenPairs = DEPOSIT_TOKENS.map(token => [
    [token, DEPOSIT_CONTRACT],
    [token, BANK_ADDRESS],
  ]).flat()
  const transform = i => `bsc:${i}`

  await sumTokens(
    balances,
    tokenPairs,
    block,
    chain,
    transform,
  )

  return balances
}

module.exports = {
  bsc: {
    tvl
  },
}