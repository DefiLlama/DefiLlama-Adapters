const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { default: BigNumber } = require('bignumber.js');
const { staking } = require('../helper/staking')

const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const DAIQUIRI = "0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b";
const MARGARITA = "0xe935C33b314330C773f9A135C0c8D8E857588609";
const FACTORY = "0x138504000feaEd02AD75B1e8BDb904f51C445F4C";
const MASTERCHEF_DAIQUIRI = "0xE4D74Af73114F72bD0172fc7904852Ee2E2b47B0";
const MASTERCHEF_MARGARITA = "0x428a6C7dEEdB7c26948c1e72Bba8d5FB5e7b6B0A"
const COREASSETNAME = "bitcoin-cash";
const CHAIN = "smartbch";
const FLEXUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const LAW = "0x0b00366fBF7037E9d75E4A569ab27dAB84759302";
const CLY = "0x7642Df81b5BEAeEb331cc5A104bd13Ba68c34B91";

const bchMasterChef = async (timestamp, ethBlock, chainBlocks) => {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, false)
    const masterchefs = [MASTERCHEF_DAIQUIRI, MASTERCHEF_MARGARITA]
    const totals = await Promise.all(masterchefs.map(async (chef) => {
        const stakedBCH = (await sdk.api.erc20.balanceOf({
            target: WBCH,
            owner: chef,
            chain: CHAIN,
            block: block,
        })).output;

        return stakedBCH
    }))
    const total = totals.reduce((sum, val) => BigNumber(sum).plus(val).toFixed(0), "0")

    return {'bitcoin-cash': BigNumber(total).dividedBy(10 ** 18).toNumber()}
}

const bchDexTvl = calculateUsdUniTvl(FACTORY, CHAIN, WBCH, [DAIQUIRI, MARGARITA], COREASSETNAME)

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (" + FACTORY + ") is used to find the LP pairs on smartBCH. TVL is equal to DEX liquidity plus the staked amounts across Pools and Farms in Daiquiri and Margarita Masterchefs. Non-native tokens staked in masterchefs are counted towards staking.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        masterchef: bchMasterChef,
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
