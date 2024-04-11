const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

module.exports = {
	methodology: methodologies.lendingMarket,
	Merlin: aaveExports('Merlin', '0x662F1DcFf1124D63e8bb01e2d1b6486428C511B3', {
		v3: true,
	}),
	Merlin: aaveExports('Merlin', '0xCB952Df3ed741dfAB56D96dAFeCd2a3A7A1fe0E1', {
		v3: true,
	}),
}
