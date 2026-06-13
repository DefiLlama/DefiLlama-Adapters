const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
	optimism: {
		tvl: sumTokensExport({ owners: [
			'0x9b86B2Be8eDB2958089E522Fe0eB7dD5935975AB',
			'0x8c9b6a4a4e61F4635E8e375E05ff98Db5516d25E',
		], tokens: [ADDRESSES.optimism.USDC, ADDRESSES.optimism.USDC_CIRCLE]})
	}
}