const { sumTokensExport } = require('../helper/unwrapLPs')

const collateralProxy = "0x29469395eAf6f95920E59F858042f0e28D98a20B"

module.exports = {
    misrepresentedTokens: true,
    methodology: 'TVL counts NFTs used as collateral to take out loans',
    ethereum: {
        tvl: sumTokensExport({ owners: [collateralProxy], resolveNFTs: true, }),
    }
}
