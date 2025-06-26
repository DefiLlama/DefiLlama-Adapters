const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')

const WBCH = ADDRESSES.smartbch.WBCH;
const rBCH = "0xb4602588E5F1F9653B6F234206c91552E457fAcB";
const FACTORY = "0x3dC4e6aC26df957a908cfE1C0E6019545D08319b";
const MASTERBREEDER = "0xeC0A7496e66a206181034F86B261DDDC1A2c406E";
const rBCH_WBCH_LP = "0xb9659B524447F53FF1019952A6eeDBb99776Ab4A";
const COREASSETNAME = "bitcoin-cash";

async function bchMasterChef(api) {
    return api.sumTokens({ owner: MASTERBREEDER, tokens: [WBCH]})
}

const bchDexTvl = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, })

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (" + FACTORY + ") is used to find the LP pairs on smartBCH. TVL is equal to AMMs liquidity plus the extra staking balance and masterchef pools.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        // masterchef: bchMasterChef,
        staking: stakingPricedLP(MASTERBREEDER, rBCH, "smartbch", rBCH_WBCH_LP, COREASSETNAME),
    },
}
