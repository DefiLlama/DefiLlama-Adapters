const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, } = require('../helper/unwrapLPs')
const { sumTokensExport, } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: 'TVL counts all assets deposited as collateral to mint Mento stablecoins.',
  celo: {
    tvl: sumTokensExport({
      owners: [
        '0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9',
        '0xD3D2e5c5Af667DA817b2D752d86c8f40c22137E1',
        '0x87647780180b8f55980c7d3ffefe08a9b29e9ae1',
        '0x9d65E69aC940dCB469fd7C46368C1e094250a400'
      ],
      tokens: [nullAddress, ADDRESSES.celo.STEUR, ADDRESSES.celo.USDT_1, ADDRESSES.celo.USDC, ADDRESSES.celo.axlUSDC, ADDRESSES.celo.USDGLO],
      chain: 'celo',
    })
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: [
        '0xd0697f70E79476195B742d5aFAb14BE50f98CC1E',
        '0xD3D2e5c5Af667DA817b2D752d86c8f40c22137E1',
        '0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186',
      ],
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.STETH, ADDRESSES.ethereum.WBTC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.sUSDS],
      chain: 'ethereum',
    })
  },
  bitcoin: {
    tvl: sumTokensExport({ owners: bitcoinAddressBook.mento })
  }
}
