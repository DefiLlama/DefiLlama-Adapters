
const { compoundExports2 } = require('../helper/compound')

const config = {
	apechain: '0xc2C583093Af9241E17B2Ec51844154468D21bF6F',
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain] })
});