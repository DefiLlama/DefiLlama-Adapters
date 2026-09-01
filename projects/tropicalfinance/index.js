const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens')
const { staking } = require('../helper/staking');
const { sumTokens2 } = require('../helper/unwrapLPs');

const WBCH = ADDRESSES.smartbch.WBCH;
const DAIQUIRI = ADDRESSES.smartbch.DAIQUIRI;
const MARGARITA = "0xe935C33b314330C773f9A135C0c8D8E857588609";
const FACTORY = "0x138504000feaEd02AD75B1e8BDb904f51C445F4C";
const MASTERCHEF_DAIQUIRI = "0xE4D74Af73114F72bD0172fc7904852Ee2E2b47B0";
const MASTERCHEF_MARGARITA = "0x428a6C7dEEdB7c26948c1e72Bba8d5FB5e7b6B0A"
const CHAIN = "smartbch";
const FLEXUSD = ADDRESSES.smartbch.flexUSD;
const LAW = ADDRESSES.smartbch.LAW;
const CLY = "0x7642Df81b5BEAeEb331cc5A104bd13Ba68c34B91";

const bchMasterChef = async (api) => {
    const masterchefs = [MASTERCHEF_DAIQUIRI, MASTERCHEF_MARGARITA]
    return sumTokens2({ api, owners: masterchefs, token: WBCH})
}

const bchDexTvl = getUniTVL({ factory: FACTORY, chain: CHAIN, useDefaultCoreAssets: true, })

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (" + FACTORY + ") is used to find the LP pairs on smartBCH. TVL is equal to DEX liquidity plus the staked amounts across Pools and Farms in Daiquiri and Margarita Masterchefs. Non-native tokens staked in masterchefs are counted towards staking.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        // masterchef: bchMasterChef,
        staking: sdk.util.sumChainTvls([
            staking(MASTERCHEF_DAIQUIRI, DAIQUIRI, "smartbch", "tropical-finance", 18),
            staking(MASTERCHEF_DAIQUIRI, FLEXUSD, "smartbch", "flex-usd", 18),
            staking(MASTERCHEF_DAIQUIRI, LAW, "smartbch", "law", 18),
            staking(MASTERCHEF_DAIQUIRI, CLY, "smartbch", "celery", 18),

            staking(MASTERCHEF_MARGARITA, MARGARITA, "smartbch", "margarita", 18),
            staking(MASTERCHEF_MARGARITA, FLEXUSD, "smartbch", "flex-usd", 18),
        ])
    },
}
