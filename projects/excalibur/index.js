const {uniTvlExport} = require('../helper/calculateUniTvl')

module.exports={
    fantom:{
        tvl: uniTvlExport("0x08b3CCa975a82cFA6f912E0eeDdE53A629770D3f", "fantom", true)
    }
}
