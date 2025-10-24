const { getUniTVL } = require("../helper/unknownTokens");
const { uniV3Export } = require('../helper/uniswapV3');

const v2Factory = "0x630db8e822805c82ca40a54dae02dd5ac31f7fcf"
const v2Tvl = getUniTVL({
    factory: v2Factory,
    useDefaultCoreAssets: true,
});

const v3Factory = "0xa1415fAe79c4B196d087F02b8aD5a622B8A827E5"
const v3FromBlock = 38145900
const v3Tvl = uniV3Export({
    xlayer: {
        factory: v3Factory,
        fromBlock: v3FromBlock,
    }
}).xlayer.tvl;

module.exports = {
    xlayer: { 
        tvl: async (api) => {
            api.addBalances(await v2Tvl(api))
            api.addBalances(await v3Tvl(api))
            return api.getBalances()
        }, 
    },
    misrepresentedTokens: true,
}