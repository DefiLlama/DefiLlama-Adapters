const { uniV3Export } = require('../helper/uniswapV3')
const ADDRESSES = require('../helper/coreAssets.json')


module.exports = {
    methodology: "Tracks the total liquidity in all Uniswap V3 pools",
    assetchain: {
        tvl: () => { return { 'assetchain:0x26E490d30e73c36800788DC6d6315946C4BbEa24': '193916170000000000' } },
    }
}
