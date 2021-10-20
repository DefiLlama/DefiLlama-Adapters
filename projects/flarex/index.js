const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    songbird: {
        tvl:calculateUsdUniTvl("0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30", "songbird", "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", [], "songbird")
    }
}