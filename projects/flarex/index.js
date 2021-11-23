const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')
const sdk = require('@defillama/sdk')

const v1 =calculateUsdUniTvl("0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30", "songbird", "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", [], "songbird")
const v2 = calculateUsdUniTvl("0x7a39408809441814469A8Fb3F5CFea1aA2774fB6", "songbird", "0x02f0826ef6aD107Cfc861152B32B52fD11BaB9ED", [], "songbird")

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x0eAC91966b12b81db18f59D8e893b9ccef7e2c30) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    songbird: {
        tvl:sdk.util.sumChainTvls([v1,v2])
    }
}