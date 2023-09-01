const { compoundExports } = require('../helper/compound')
const { staking } = require('../helper/staking');

const optimismConfig = {
  unitroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
  chain: 'optimism'
}

const baseConfig = {
  unitroller: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0',
  chain: 'base'
}

// OPTIMISM CHAIN
const optimismTVL = compoundExports(optimismConfig.unitroller, optimismConfig.chain)

// BASE CHAIN
const baseTVL = compoundExports(baseConfig.unitroller, baseConfig.chain)

module.exports = {
  optimism: { ...optimismTVL,
				staking: staking(
				  [
					"0xdc05d85069dc4aba65954008ff99f2d73ff12618",
					"0x41279e29586eb20f9a4f65e031af09fced171166",
				  ],
				  "0x1DB2466d9F5e10D7090E7152B68d62703a2245F0"
				),
	          },
  base: { ...baseTVL }
}
