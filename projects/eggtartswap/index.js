const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    harmony: {
        tvl:calculateUsdUniTvl("0x65CED3c0Af7CDcC64Fb3eE5F021F9b4E65467812", "harmony", "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a", [], "harmony")
    }
} 