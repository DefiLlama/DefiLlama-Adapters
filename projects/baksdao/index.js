const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport, } = require('../helper/unwrapLPs')

const DEPOSIT_TOKENS = [
  ADDRESSES.bsc.WBNB, // wBnB
  ADDRESSES.bsc.ETH, //ETH,
  ADDRESSES.bsc.USDT, // USDT
  ADDRESSES.bsc.BTCB, // BTC
]

const DEPOSIT_CONTRACT = '0xe94286A3e83D66aB3bAF9840184a2E5680e9A7eC'
const BANK_ADDRESS = '0x86D21a8183e150e5050ba5DFd53535b6dE100435'

module.exports = {
  bsc: {
    tvl: sumTokensExport({ owners: [DEPOSIT_CONTRACT, BANK_ADDRESS], tokens: DEPOSIT_TOKENS,  }),
  },
}