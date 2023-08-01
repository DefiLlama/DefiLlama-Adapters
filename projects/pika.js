const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokensExport } = require('./helper/unwrapLPs')

module.exports = {
	optimism: {
		tvl: sumTokensExport({ owners: [
			'0x2FaE8C7Edd26213cA1A88fC57B65352dbe353698',
			'0xD5A8f233CBdDb40368D55C3320644Fb36e597002',
		], tokens: [ADDRESSES.optimism.USDC]})
	}
}