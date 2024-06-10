const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens');

const USDe = ADDRESSES.ethereum.USDe
const USDT = ADDRESSES.ethereum.USDT

const contractAddress = '0x96E65d1ae193A15b19500AEA8F7f739989C810ea'

module.exports = {
    ethereum: {
      tvl: sumTokensExport({
        owners: [contractAddress],
        tokens: [USDe, USDT]
      }),
    }
}
