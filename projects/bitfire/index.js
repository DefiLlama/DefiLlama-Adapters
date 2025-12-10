
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
//update protocol information

module.exports = {
	methodology: methodologies.lendingMarket,
	mezo: aaveExports('mezo', '0xD489a9cc2eF0b990c6a30Ed9AfF6EC63A2765F25', undefined, ['0xBB7cF099BAfc69a30D4f21878F2FE3Ac10e768fA'], {
		v3: true, abis: {
			getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
		}
	}),
}