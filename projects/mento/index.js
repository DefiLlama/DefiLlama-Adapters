const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, } = require('../helper/unwrapLPs')
const { sumTokensExport, } = require('../helper/sumTokens')

module.exports = {
  methodology: 'TVL counts Celo deposited as collateral to mint cUSD.',
  celo: {
    tvl: sumTokensExport({
      owners: ['0x9380fA34Fd9e4Fd14c06305fd7B6199089eD4eb9', '0x246f4599eFD3fA67AC44335Ed5e749E518Ffd8bB', '0x298FbD6dad2Fc2cB56d7E37d8aCad8Bf07324f67',],
      tokens: [nullAddress],
      chain: 'celo',
    })
  },
  ethereum: {
    tvl: sumTokensExport({
      owners: ['0xe1955eA2D14e60414eBF5D649699356D8baE98eE', '0x8331C987D9Af7b649055fa9ea7731d2edbD58E6B', '0x26ac3A7b8a675b741560098fff54F94909bE5E73', '0x16B34Ce9A6a6F7FC2DD25Ba59bf7308E7B38E186', ],
      tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.DAI, ],
      chain: 'ethereum',
    })
  },
  bitcoin: {
    tvl: sumTokensExport({ owners: ['38EPdP4SPshc5CiUCzKcLP9v7Vqo5u1HBL', '3KWX93e2zPPQ2eWCsUwPAB6VhAKKPLACou'], })
  }
}
