const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x26e13874ad1cd512b29795dafe3937e1c6f6d507) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    zyx: {
        tvl:calculateUsdUniTvl("0x26e13874ad1cd512b29795dafe3937e1c6f6d507", "zyx", "0xc9e1aea009b0bae9141f3dc7523fb42fd48c8656", ["0xefcaa73145b5e29eefc47bcbaeff9e870fa6a610", "0xb99c32a2da6766158b4ccf29b26e75dc22606ebd"], "zyx")
    }
}