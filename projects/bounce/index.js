
const { sumTokensExport } = require('../helper/unwrapLPs')

const AUCTION = '0xA9B1Eb5908CfC3cdf91F9B8B3a74108598009096'
const AUCTION_ETH_SLP = '0x0f8086d08a69ebd8e3a130a87a3b6a260723976f'

const STAKING_ADDRESS = '0x98945BC69A554F8b129b09aC8AfDc2cc2431c48E'
const STAKING_LP_ADDRESS = '0xbe5a88b573290e548759520a083a61051b258451'
const MULTI_SIG_ADDRESS = '0xc9297466C6c7acc799Fb869806C53398b8B10680'

module.exports = {
  ethereum: {
    tvl: sumTokensExport({}),
    pool2: sumTokensExport({ owner: STAKING_LP_ADDRESS, tokens: [AUCTION_ETH_SLP] }),
    staking: sumTokensExport({ owner: STAKING_ADDRESS, tokens: [AUCTION] }),
  },
}
