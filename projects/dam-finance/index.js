const { sumTokensExport } = require('../helper/unwrapLPs')
const ethCollateralJoins = ["0xB1fbcD7415F9177F5EBD3d9700eD5F15B476a5Fe"]

module.exports = {
    methodology: 'Currently counting the USDC that DAM Finance has locked up, but will add more collateral types and multiple chains in the future',
    start: 16375673, // LMCV Deployment Block
    ethereum: {
        tvl: sumTokensExport({
            tokens: ['0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'],
            owners: ethCollateralJoins
        })
    }
}; 