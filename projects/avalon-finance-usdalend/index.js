
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')

//@note Main & Innovative Markets
const getExports = address => aaveExports(address, '', undefined, [address], { v3: true })
const mainMarket = {
	iotex: getExports('0xDB52DD393e3a5e95d3B7C7e1C42cC06bb807A369'),
	taiko: getExports('0x5EcDC2432ED77cD8E2cE6183712c5cc712c40ec0'),
	zircuit: getExports('0x5EcDC2432ED77cD8E2cE6183712c5cc712c40ec0'),
}

module.exports = mergeExports(
	mainMarket,
)

module.exports.methodology = methodologies.lendingMarket
