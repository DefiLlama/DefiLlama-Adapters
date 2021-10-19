const {calculateUsdUniTvl} = require('../helper/getUsdUniTvl')

module.exports={
    rsk: {
        tvl:calculateUsdUniTvl("0xfaa7762f551bba9b0eba34d6443d49d0a577c0e1", "rsk", "0x967f8799af07df1534d48a95a5c9febe92c53ae0", [], "bitcoin")
    }
}