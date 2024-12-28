
const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

module.exports = {
	methodology: methodologies.lendingMarket,
	bevm: aaveExports('bevm', '0x26fb0b1eef8822f8F71a385d2839b6a654cA186a', undefined, ['0x3Eb2Dd6c395B8E6E3ab843858480aC60e9D0f3Bc'], {
		v3: true, abis: {
			getAllATokens: "function getAllBTokens() view returns (tuple(string symbol, address tokenAddress)[])",
		}
	}),
}