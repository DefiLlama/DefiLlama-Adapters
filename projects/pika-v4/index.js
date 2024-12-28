const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/unwrapLPs')

module.exports = {
	optimism: {
		tvl: sumTokensExport({ owners: [
			'0x9b86B2Be8eDB2958089E522Fe0eB7dD5935975AB',
		], tokens: [ADDRESSES.optimism.USDC]})
	}
}