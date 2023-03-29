const {uniTvlExport} = require("../helper/calculateUniTvl")

const factory = "0x45523BD2aB7E563E3a0F286be1F766e77546d579";


module.exports = {
    cronos: {
        tvl:uniTvlExport(factory, 'cronos')
    }
}