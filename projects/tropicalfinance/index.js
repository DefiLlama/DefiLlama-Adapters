const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const DAIQUIRI = "0x24d8d5Cbc14FA6A740c3375733f0287188F8dF3b";
const FACTORY = "0x138504000feaEd02AD75B1e8BDb904f51C445F4C";
const TRAVELBUREAU = "0xE4D74Af73114F72bD0172fc7904852Ee2E2b47B0";
const DAIQUIRI_WBCH_LP = "0xF1Ac59acb449C8e2BA9D222cA1275b3f4f9a455C";
const COREASSETNAME = "bitcoin-cash";
const CHAIN = "smartbch";

async function bchMasterChef(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, true);

    const stakedBCH = (await sdk.api.erc20.balanceOf({
        target: WBCH,
        owner: TRAVELBUREAU,
        chain: CHAIN,
        block: block,
        decimals: 18
    })).output;

    return {
        [COREASSETNAME]: Number(stakedBCH)
    }
}

const bchDexTvl = calculateUsdUniTvl(FACTORY, CHAIN, WBCH, [DAIQUIRI], COREASSETNAME)

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (" + FACTORY + ") is used to find the LP pairs on smartBCH. TVL is equal to DEX liquidity plus the staked amounts across Pools and Farms in Masterchef.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        staking: stakingPricedLP(TRAVELBUREAU, DAIQUIRI, "smartbch", DAIQUIRI_WBCH_LP, COREASSETNAME),
    },
}
