const {uniTvlExport} = require('../helper/calculateUniTvl.js')
const { staking } = require('../helper/staking')

module.exports = {
  ethereum:{
    tvl: uniTvlExport("0x822EF744C568466D40Ba28b0f9e4A4961837a46a", "ethereum"),
    staking: staking("0x848578e351d25b6ec0d486e42677891521c3d743", "0x3Fd3A0c85B70754eFc07aC9Ac0cbBDCe664865A6","ethereum"),
  },
}