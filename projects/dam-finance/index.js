const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')
const ethCollateralJoins = ["0xB1fbcD7415F9177F5EBD3d9700eD5F15B476a5Fe"]

module.exports = {
    methodology: 'Currently counting the USDC that DAM Finance has locked up, but will add more collateral types and multiple chains in the future',
    ethereum: {
        tvl: sumTokensExport({
            tokens: [ADDRESSES.ethereum.USDC],
            owners: ethCollateralJoins
        })
    }
}; 