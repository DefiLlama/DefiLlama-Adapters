const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');
const { getUniTVL } = require('../helper/unknownTokens')
const { stakingPriceLP } = require('../helper/staking')

const WBCH = ADDRESSES.smartbch.WBCH;
const EBEN = "0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B";
const FACTORY = "0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D";
const MASTERBREEDER = "0xDEa721EFe7cBC0fCAb7C8d65c598b21B6373A2b6";
const EBEN_WBCH_LP = "0x0D4372aCc0503Fbcc7EB129e0De3283c348B82c3";
const COREASSETNAME = "bitcoin-cash";

async function bchMasterChef(api) {
    const bal = await api.call({  abi: 'erc20:balanceOf', target: WBCH, params: MASTERBREEDER})
    api.add(WBCH, bal)
    return api.getBalances()
}

const bchDexTvl = getUniTVL({ factory: FACTORY, useDefaultCoreAssets: true, })

module.exports = {
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs on smartBCH and Factory address (0x4dC6048552e2DC6Eb1f82A783E859157d40FA193) is used to find the liquidity of the pairs on BSC. TVL is equal to the liquidity on both AMMs plus the extra staking balance and masterchef pools.",
    smartbch: {
        tvl: sdk.util.sumChainTvls([bchDexTvl, bchMasterChef]),
        staking: stakingPriceLP(MASTERBREEDER, EBEN, "smartbch", EBEN_WBCH_LP, COREASSETNAME),
    },
    bsc: {
        tvl: getUniTVL({ factory: '0x4dC6048552e2DC6Eb1f82A783E859157d40FA193', useDefaultCoreAssets: true }),
        staking: stakingPriceLP("0x03245d87295cd0783e1f10a2ea54f9e80b726af8", "0x8173dda13fd405e5bca84bd7f64e58caf4810a32", "0x4558e53328cddd5877b7348702c991f521aa35c0", "binancecoin", true),
    },
}
