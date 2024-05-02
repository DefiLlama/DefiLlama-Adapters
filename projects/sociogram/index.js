const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const TREASURY = '0xcf2a2540f31b0f4a443a5bddb01b35eca059ab60'


module.exports = {
	arbitrum: {
		tvl: sumTokensExport({
			owner: TREASURY,
			tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.null],
		})
	},
	ethereum: {
		tvl: sumTokensExport({
			owner: TREASURY,
			tokens: [ADDRESSES.ethereum.USDT, ADDRESSES.null],
		})
	},
	polygon: {
		tvl: sumTokensExport({
			owner: TREASURY,
			tokens: [ADDRESSES.polygon.USDT, ADDRESSES.null],
		})
	},
	bsc: {
		tvl: sumTokensExport({
			owner: TREASURY,
			tokens: [ADDRESSES.bsc.USDT, ADDRESSES.null],
		})
	},
	optimism: {
		tvl: sumTokensExport({
			owner: TREASURY,
			tokens: [ADDRESSES.optimism.USDT, ADDRESSES.null],
		})
	}
}
