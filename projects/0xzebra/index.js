const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require('../helper/sumTokens')

module.exports = {
	zeta: {
		tvl: sumTokensExport({ owner: '0x3aC3d90dc8cB1Cacf1Fd8bc07e4B76c5EA443279', tokens: [ADDRESSES.zeta.WZETA] }),
	}
}