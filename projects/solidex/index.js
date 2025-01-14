const abis = require("./abis.json");

const SOLID = '0x888EF71766ca594DED1F0FA3AE64eD2941740A20';

async function tvl(api) {
	const pairs = await api.fetchList({  lengthAbi: abis.allPairsLength, itemAbi: abis.allPairs, target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28' })
	const tokens = await api.multiCall({  abi: abis.tokens, calls: pairs})
	const ownerTokens = tokens.map((t, i) => [t, pairs[i]])
	return api.sumTokens({ ownerTokens })
}

async function staking(api) {
	const { amount } = await api.call({
		target: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
		abi: abis.locked,
		params: [8],
	})
	api.add(SOLID, amount)
}

module.exports = {
	doublecounted: true,
	fantom: {
		tvl,
		staking,
	}
};
