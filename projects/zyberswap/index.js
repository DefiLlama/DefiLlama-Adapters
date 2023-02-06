
const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ZYBER = "0x3B475F6f2f41853706afc9Fa6a6b8C5dF1a2724c";
const lps = ['0x3eC0eddCd1e25025077327886A78133589082fB2']

module.exports = {
    methodology: `Uses factory(0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ZYB staking.`,
    arbitrum: {
        tvl: getUniTVL({ factory: '0xaC2ee06A14c52570Ef3B9812Ed240BCe359772e7', fetchBalances: true, useDefaultCoreAssets: true }),
        staking: sumTokensExport({
            owner: '0xEFf77E179f6abb49a5bf0EC25c920B495e110C3b',
            tokens: [ZYBER],
            useDefaultCoreAssets: true,
            lps
        })
    }
};


