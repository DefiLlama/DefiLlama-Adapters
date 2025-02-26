const { compoundExports2 } = require('../helper/compound')
const { staking } = require('../helper/staking');


const config = {
	optimism: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
	base: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0'
}

Object.keys(config).forEach(chain => {
	module.exports[chain] = compoundExports2({ comptroller: config[chain] })
})
module.exports.optimism.staking = staking(["0xdc05d85069dc4aba65954008ff99f2d73ff12618", "0x41279e29586eb20f9a4f65e031af09fced171166"], "0x1DB2466d9F5e10D7090E7152B68d62703a2245F0")
module.exports.hallmarks = [
	[1715731260,"donation attack exploit"],
  ]
  module.exports.optimism.borrowed = ()=>({}) // bad debt after hack