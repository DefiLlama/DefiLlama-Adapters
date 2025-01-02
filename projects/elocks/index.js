const { sumTokens2 } = require("../helper/unwrapLPs")

const IELOCKS = {
	lockedAssets: "function lockedAssets(uint) public view returns (address token, uint balance, uint)"
}

const elocks = {
	fantom: "0x2f20A659601d1c161A108E0725FEF31256a907ad"
}

module.exports = {
	misrepresentedTokens: true,
}

Object.keys(elocks).forEach(chain => {
	module.exports[chain] = {
		tvl: async (api) => {
			const data = await api.fetchList({ lengthAbi: 'totalSupply', itemAbi: IELOCKS.lockedAssets, target: elocks[api.chain], startFromOne: true, })
			data.forEach(i => api.addToken(i.token, i.balance))
			return sumTokens2({ api, resolveLP: true})
		},
	}
})