const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const WONE = "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a"

module.exports = {
    misrepresentedTokens: true,
    harmony: {
        tvl: calculateUsdUniTvl("0x44485473431fAF6EFA11D346d1057182d2A0A290", "harmony", WONE,
            [
                '0x97594E465e6B4df48e58327f566a3F79E9274655', // ADENA
                '0x985458e523db3d53125813ed68c274899e9dfab4', // USDC
                '0xe176ebe47d621b984a73036b9da5d834411ef734', // BUSD
                '0x224e64ec1bdce3870a6a6c777edd450454068fec', // UST
                '0x0ab43550a6915f9f67d0c454c2e90385e6497eaa' // bscBUSD
            ],  "harmony"),
    }
}