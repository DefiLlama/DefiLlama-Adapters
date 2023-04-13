const { sumTokens, } = require('../helper/unwrapLPs')
const { transformBscAddress, } = require('../helper/portedTokens');

const chain = 'bsc'

const DEPOSIT_TOKENS = [
  '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // wBnB
  '0x2170Ed0880ac9A755fd29B2688956BD959F933F8', //ETH,
  '0x55d398326f99059fF775485246999027B3197955', // USDT
  '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c', // BTC
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
  const transform = await transformBscAddress()

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