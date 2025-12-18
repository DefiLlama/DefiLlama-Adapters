const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
	ethereum: { managers: ['0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E', '0x19d6D19a034BB886507DC08dF99716f418bD61a3', '0xbE721812442C648c191Bc267659374036fd68918'] },
	bsc: { managers: ['0xbebbaE6f1062E4Cd5652B9d8e1B8aECBEE993A9E', '0x19d6D19a034BB886507DC08dF99716f418bD61a3', '0x8849FCE3fB3d82BBF14e1FC9D7E82EAfEB4b2904'] },
	polygon: { managers: ['0x8849FCE3fB3d82BBF14e1FC9D7E82EAfEB4b2904', '0xbE49a740c48F9D4347De8994c488333d492a4e19', '0x9C1A18A734dFAe6e6f89942f358e7270BecdB002'] },
}

module.exports.deadFrom = '2025-05-03'

Object.keys(config).forEach(chain => {
	const { managers, } = config[chain]
	module.exports[chain] = {
		tvl: async (api) => {
			const safeHouses = await api.multiCall({ abi: 'address:safeHouse', calls: managers })
			const assetBooks = await api.multiCall({ abi: 'address:assetBook', calls: safeHouses })
			const tokens = await api.fetchList({ lengthAbi: 'getAssetsListSize', itemAbi: 'assetsList', calls: assetBooks, groupedByInput: true, })
			const ownerTokens = tokens.map((t, i) => [t, safeHouses[i]])
			return sumTokens2({ api, ownerTokens, permitFailure: true })
		}
	}
})