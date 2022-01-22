const {uniTvlExport} = require('../helper/calculateUniTvl')

module.exports={
    fantom:{
        tvl: uniTvlExport("0x39720E5Fe53BEEeb9De4759cb91d8E7d42c17b76", "fantom")
    }
}