const { compoundExports2 } = require('../helper/compound')

const config = {
	apechain: '0xc2C583093Af9241E17B2Ec51844154468D21bF6F',
	unichain: '0x086036b34689709cFAE75dfC453846b744bD8dcA',
	soneium: '0x5075A7E2B018f352220874718E3f5Bd38C6DFD5D',
	sty: '0x5075A7E2B018f352220874718E3f5Bd38C6DFD5D',
	hemi: '0xc2C583093Af9241E17B2Ec51844154468D21bF6F'
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain] })
});