const sdk = require('@defillama/sdk');
const { getBlock } = require('../helper/getBlock');
const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')
const { stakingPricedLP } = require('../helper/staking')

const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04";
const EBEN = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B";
const FACTORY = "0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D";
const MASTERBREEDER = "0xDEa721EFe7cBC0fCAb7C8d65c598b21B6373A2b6";
const EBEN_WBCH_LP = "0x0D4372aCc0503Fbcc7EB129e0De3283c348B82c3";
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

const bchDexTvl = calculateUsdUniTvl(FACTORY, CHAIN, WBCH, [EBEN], COREASSETNAME)

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs on smartBCH and Factory address (0x4dC6048552e2DC6Eb1f82A783E859157d40FA193) is used to find the liquidity of the pairs on BSC. TVL is equal to the liquidity on both AMMs plus the extra staking balance and masterchef pools.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        masterchef: bchMasterChef,
        staking: stakingPricedLP(MASTERBREEDER, EBEN, "smartbch", EBEN_WBCH_LP, COREASSETNAME),
    },
    bsc: {
        tvl: calculateUsdUniTvl("0x4dC6048552e2DC6Eb1f82A783E859157d40FA193", "bsc", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", ["0x8173dDa13Fd405e5BcA84Bd7F64e58cAF4810A32"], "binancecoin"),
        staking: stakingPricedLP("0x03245d87295cd0783e1f10a2ea54f9e80b726af8", "0x8173dda13fd405e5bca84bd7f64e58caf4810a32", "bsc", "0x4558e53328cddd5877b7348702c991f521aa35c0", "binancecoin", true),
    },
}
