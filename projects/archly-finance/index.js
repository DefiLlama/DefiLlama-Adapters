const {uniTvlExport} = require('../helper/calculateUniTvl.js')

module.exports = {
    doublecounted: false,
    timetravel: true,
    telos:{
        tvl: uniTvlExport("0x39fdd4Fec9b41e9AcD339a7cf75250108D32906c", "telos"),
    },
}