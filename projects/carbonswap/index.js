const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    misrepresentedTokens: true,
    methodology: "Factory address (0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd) is used to find the LP pairs. TVL is equal to the liquidity on the AMM.",
    energyweb: {
        tvl:calculateUsdUniTvl("0x17854c8d5a41d5A89B275386E24B2F38FD0AfbDd", "energyweb", "0x6b3bd0478DF0eC4984b168Db0E12A539Cc0c83cd", ["0xe1BCdcd419Eb96d67D3eAb707FC108eD9172aDc7", "0x593122AAE80A6Fc3183b2AC0c4ab3336dEbeE528", "0x3862F260e94904aaAe628DdF427b1F662652BBD2"], "energy-web-token")
    }
}