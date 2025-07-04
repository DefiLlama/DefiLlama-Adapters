const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
	bsc: {
		tvl: sumTokensExport({ owner: '0xcC48B55F6c16d4248EC6D78c11Ba19c1183Fe0F7', tokens: [ADDRESSES.bsc.SOON] }),
	}
}