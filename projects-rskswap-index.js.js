const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    harmony: {
        tvl:calculateUsdUniTvl("0x7f107365E6Ef1F8824C724EA6aF7654AFB742963", "harmony", "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a", [], "harmony")
    }
}