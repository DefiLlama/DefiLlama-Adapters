const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D) is used to find the LP pairs on smartBCH and Factory address (0x4dC6048552e2DC6Eb1f82A783E859157d40FA193) is used to find the liquidity of the pairs on BSC. TVL is equal to the liquidity on both AMMs.",
    smartbch: {
        tvl:calculateUsdUniTvl("0x8d973bAD782c1FFfd8FcC9d7579542BA7Dd0998D", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0x77CB87b57F54667978Eb1B199b28a0db8C8E1c0B"], "bitcoin-cash"),
      
    },
    bsc: {
        tvl:calculateUsdUniTvl("0x4dC6048552e2DC6Eb1f82A783E859157d40FA193", "bsc", "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", ["0x8173dDa13Fd405e5BcA84Bd7F64e58cAF4810A32"], "binancecoin"),
    },
}