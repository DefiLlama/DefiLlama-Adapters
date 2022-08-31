const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const FACTORIES = "0x6A6a541FFb214ca228A58c27bD61b5A099Dc82CC"

const NATIVE_TOKEN_WASTAR = "0xAeaaf0e2c81Af264101B9129C00F4440cCF0F720"

module.exports = {
    misrepresentedTokens: true,
    methodology: "AGS Finance Tvl Calculation",
    astar: {
        tvl: calculateUsdUniTvl(
            FACTORIES, 
            "astar", 
            NATIVE_TOKEN_WASTAR,
            [
                NATIVE_TOKEN_WASTAR,
                "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
                "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
                "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
                "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4",
                "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
                "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
                "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
                "0x81bC9336f22D832555ceA0Ad84A3FD7F7426cf47"
            ],
            "astar"
        ),
    }
};

