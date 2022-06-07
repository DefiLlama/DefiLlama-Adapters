const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    harmony: {
        tvl:calculateUsdUniTvl("0x021AeF70c404aa9d70b71C615F17aB3a4038851A", "harmony", "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a", [], "harmony")
    }
}