
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')

//@note Main & Innovative Markets
const mainMarket = {
	iotex: aaveExports('', '', undefined, ['0xDB52DD393e3a5e95d3B7C7e1C42cC06bb807A369'], { v3: true }),
	taiko: aaveExports('', '', undefined, ['0x5EcDC2432ED77cD8E2cE6183712c5cc712c40ec0'], { v3: true }),
	zircuit: aaveExports('', '', undefined, ['0x5EcDC2432ED77cD8E2cE6183712c5cc712c40ec0'], { v3: true }),
}

module.exports = mergeExports(
	mainMarket,
)

module.exports.methodology = methodologies.lendingMarket
