const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const rBCH = "0xb4602588E5F1F9653B6F234206c91552E457fAcB";
const FACTORY = "0x3dC4e6aC26df957a908cfE1C0E6019545D08319b";
const MASTERBREEDER = "0xeC0A7496e66a206181034F86B261DDDC1A2c406E";
const rBCH_WBCH_LP = "0xb9659B524447F53FF1019952A6eeDBb99776Ab4A";
const COREASSETNAME = "bitcoin-cash";
const CHAIN = "smartbch";

async function bchMasterChef(timestamp, ethBlock, chainBlocks) {
    const block = await getBlock(timestamp, CHAIN, chainBlocks, true);

    const stakedBCH = (await sdk.api.erc20.balanceOf({
        target: WBCH,
        owner: MASTERBREEDER,
        chain: CHAIN,
        block: block,
        decimals: 18
    })).output;

    return {
        [COREASSETNAME]: Number(stakedBCH)
    }
}

const bchDexTvl = calculateUsdUniTvl(FACTORY, CHAIN, WBCH, [rBCH], COREASSETNAME)

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (" + FACTORY + ") is used to find the LP pairs on smartBCH. TVL is equal to AMMs liquidity plus the extra staking balance and masterchef pools.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        masterchef: bchMasterChef,
        staking: stakingPricedLP(MASTERBREEDER, rBCH, "smartbch", rBCH_WBCH_LP, COREASSETNAME),
    },
}
