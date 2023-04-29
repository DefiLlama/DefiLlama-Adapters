const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPricedLP } = require('../helper/staking')

const WBCH = ADDRESSES.smartbch.WBCH;
const EBEN = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B";
const FLEXUSD = ADDRESSES.smartbch.flexUSD;
const FACTORY = "0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D";
const MASTERBREEDER = "0xDEa721EFe7cBC0fCAb7C8d65c598b21B6373A2b6";
const EBEN_WBCH_LP = "0x0D4372aCc0503Fbcc7EB129e0De3283c348B82c3";
const COREASSETNAME = "bitcoin-cash";
const CHAIN = "smartbch";

async function bchMasterChef(timestamp, ethBlock, {[CHAIN]: block}) {

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

const bchDexTvl = getUniTVL({ chain: 'smartbch', factory: FACTORY, useDefaultCoreAssets: true, })

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs on smartBCH and Factory address (0x4dC6048552e2DC6Eb1f82A783E859157d40FA193) is used to find the liquidity of the pairs on BSC. TVL is equal to the liquidity on both AMMs plus the extra staking balance and masterchef pools.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        // masterchef: bchMasterChef,
        staking: stakingPricedLP(MASTERBREEDER, EBEN, "smartbch", EBEN_WBCH_LP, COREASSETNAME),
    },
    bsc: {
        tvl: getUniTVL({ factory: '0x4dC6048552e2DC6Eb1f82A783E859157d40FA193', chain: 'bsc', useDefaultCoreAssets: true }),
        staking: stakingPricedLP("0x03245d87295cd0783e1f10a2ea54f9e80b726af8", "0x8173dda13fd405e5bca84bd7f64e58caf4810a32", "bsc", "0x4558e53328cddd5877b7348702c991f521aa35c0", "binancecoin", true),
    },
}
