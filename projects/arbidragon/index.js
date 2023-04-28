const { getUniTVL, sumTokensExport } = require('../helper/unknownTokens')
const ARBID = "0xf3f45fA22c374c82Ca8573FFCb8D529B9e1A27A1";

const dexTVL = getUniTVL({ factory: '0xC9E7aC651Bc55EcF554f53bB4B6e17b9A1A22A84',  useDefaultCoreAssets: true })


module.exports = {
    misrepresentedTokens: true,
    methodology: `Uses factory(0xC9E7aC651Bc55EcF554f53bB4B6e17b9A1A22A84) address and whitelisted tokens address to find and price Liquidity Pool pairs. We also have our native token $ARBID staking.`,
    arbitrum: {
        tvl: dexTVL,
        staking: sumTokensExport({
            owners: ['0x121ce0D6974e7aF53D9158178AE3A404B45cF7ad', '0xA73e49336e8c256017A00428b250Cd095b25555E'],
            tokens: [ARBID],
        })
    }
};
