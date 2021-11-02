const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    smartbch: {
        tvl:calculateUsdUniTvl("0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B"], "bitcoin-cash"),
        
    }
}