const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const AFI = "0x360111d897d32614619F37f151061c8D431a47f9";

const dexTVL = getUniTVL({ factory: '0xd430999a8034cbc0eC84f7e5C6442470D20ef997',  useDefaultCoreAssets: true, })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xd430999a8034cbc0eC84f7e5C6442470D20ef997) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $AFI staking.`,
    ethereum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0x08d1199E3Be6e703644ac83C3159F6E169089996', '0xe8054a77fAb0ca0e1f7a750f34B9E064b366ebe6'],
            tokens: [AFI],
        })
    }
};
