const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking')

const TANGO = "0x73BE9c8Edf5e951c9a0762EA2b1DE8c8F38B5e91"
const xTANGO = "0x98Ff640323C059d8C4CB846976973FEEB0E068aA";
const FACTORY = "0x2F3f70d13223EDDCA9593fAC9fc010e912DF917a";

module.exports = {
    methodology: "Count TVL as liquidity on the dex",
    misrepresentedTokens: true,
    smartbch: {
        tvl: getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true }),
        staking: staking(xTANGO, TANGO, 'smartbch', 'tangoswap', 18)
    }
}
