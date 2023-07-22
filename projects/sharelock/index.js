const { getUniTVL } = require('../helper/unknownTokens');
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
    methodology: 'Counts liquidity in pools',
    start: 9071500,
    era: {
        tvl: getUniTVL({
            owners: ['0x4E0a5eeDa9b4b4Daa07Fe3fc62cB3f2f6772cb6F', '0xAaB94b8C7FbB92727Fd61DA80034eA1bBe75F1fb'],
            tokens: [
                ADDRESSES.era.WETH,
                ADDRESSES.era.USDC,
                ADDRESSES.era.USDT,
                ADDRESSES.era.BUSD]
        }),
    }
};