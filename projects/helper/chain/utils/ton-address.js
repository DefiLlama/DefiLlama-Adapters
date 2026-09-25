// TON address codec lives in @defillama/sdk (`sdk.chains.ton`)
const { ton } = require('@defillama/sdk').chains

module.exports = {
	addressToInt: ton.addressToInt,
	convertIntToAddress: ton.convertIntToAddress,
	compareAddress: ton.compareAddress,
};
