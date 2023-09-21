const { getCompoundUsdTvl } = require('../helper/compound')


const config = {
	klaytn: '0xEE3Db1711ef46C04c448Cb9F5A03E64e7aa22814'	
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = {
    tvl: getCompoundUsdTvl( config[chain] , 'klaytn','0xAC6a4566D390a0da085C3d952fb031ab46715BCf',false),
    borrowed: getCompoundUsdTvl( config[chain] , 'klaytn','0xAC6a4566D390a0da085C3d952fb031ab46715BCf',true)
  }
})  