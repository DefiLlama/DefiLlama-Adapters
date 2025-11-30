const { aaveExports } = require('../helper/aave')

module.exports = {
	pulse: aaveExports(
		'pulse', 
		'0x6a52A961CF2241Cca78F8e5Fdc980a824afD6d8c', // PoolAddressesProviderRegistry
		undefined, 
		['0x1847a4e03D02cf2b86614153Eb76432fF499C732'], // PoolDataProvider-Pulse
		{ v3: true }
	),
}

