const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')


module.exports={
    boba:{
        tvl: calculateUsdUniTvl("0x05a7c34E97A6733dc319E0d2347816e5c1f003D0", "boba", "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", [], "ethereum")
    }
}