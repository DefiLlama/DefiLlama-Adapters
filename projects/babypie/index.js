const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens.js');
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.magpie }),
  },
  ethereum: { tvl: sumTokensExport({ owners: ['0xE813FFA7932f2D182F0ae89254acFD0bAa6E2Df3','0x9f4f69DdD56BbcAE6F164AccE3a99afeF840B79f'], tokens: [ADDRESSES.ethereum.WBTC,'0x8BB97A618211695f5a6a889faC3546D1a573ea77'] }) },
}
