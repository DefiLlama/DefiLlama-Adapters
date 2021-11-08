const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    esc: {
        tvl:calculateUsdUniTvl("0xaAbe38153b25f0d4b2bDa620f67059B3a45334e5", "esc", "0x517E9e5d46C1EA8aB6f78677d6114Ef47F71f6c4", ["0x802c3e839E4fDb10aF583E3E759239ec7703501e", "0xA06be0F5950781cE28D965E5EFc6996e88a8C141"], "elastos")
    }
}