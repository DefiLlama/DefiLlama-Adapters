const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, } = require('../helper/unwrapLPs')
const { sumTokensExport, } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: 'TVL counts all assets deposited as collateral to mint Mento stablecoins.',
  celo: {
    tvl: sumTokensExport({
      owners: ['0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9', '0x246f4599eFD3fA67AC44335Ed5e749E518Ffd8bB', '0x298FbD6dad2Fc2cB56d7E37d8aCad8Bf07324f67', '0x87647780180b8f55980c7d3ffefe08a9b29e9ae1'],
      tokens: [nullAddress, ADDRESSES.celo.STEUR, ADDRESSES.celo.USDT_1],
      chain: 'celo',
    })
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: ['0xe1955eA2D14e60414eBF5D649699356D8baE98eE', '0x8331C987D9Af7b649055fa9ea7731d2edbD58E6B', '0x26ac3A7b8a675b741560098fff54F94909bE5E73', '0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186', '0xd0697f70E79476195B742d5aFAb14BE50f98CC1E'],
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.DAI, ADDRESSES.ethereum.SDAI, ADDRESSES.ethereum.STETH ],
      chain: 'ethereum',
    })
  },
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.mento })
  }
}
