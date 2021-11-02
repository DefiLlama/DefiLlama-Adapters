const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const { staking } = require("../helper/staking");

const mistToken = "0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129"
const masterChef = "0x3A7B9D0ed49a90712da4E087b17eE4Ac1375a5D4"



module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x6008247F53395E7be698249770aa1D2bfE265Ca0) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    smartbch: {
        tvl:calculateUsdUniTvl("0x6008247F53395E7be698249770aa1D2bfE265Ca0", "smartbch", "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04", ["0x5fA664f69c2A4A3ec94FaC3cBf7049BD9CA73129"], "bitcoin-cash"),
        //staking: staking(masterChef, mistToken, "smartbch", "", 18), MIST token still not on coingecko
    }
}