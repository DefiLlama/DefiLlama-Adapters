async function tvl(api) {
	const factories = Object.values({
		"CurveStableswapFactoryNG": "0x4412140D52C1F5834469a061927811Abb6026dB7",
		"CurveTwocryptoFactoryNG": "0xf0E48dC92f66E246244dd9F33b02f57b0E69fBa9",
		"CurveTricryptoFactoryNG": "0xebd098c60b1089f362AC9cfAd9134CBD29408226",
	})
	const ownerTokens = []
	const blacklistedTokens = []
	for (const factory of factories) {
		const pools = await api.fetchList({ lengthAbi: 'pool_count', itemAbi: 'pool_list', target: factory, })
		let res = 'address[]'
		if (factory === '0xf0E48dC92f66E246244dd9F33b02f57b0E69fBa9') res = 'address[2]'
		if (factory === '0xebd098c60b1089f362AC9cfAd9134CBD29408226') res = 'address[3]'
		const tokens = await api.multiCall({ abi: 'function get_coins(address) view returns (' + res + ')', calls: pools, target: factory, })
		blacklistedTokens.push(...pools)
		ownerTokens.push(...tokens.map((t, i) => [t, pools[i]]))
	}
	return api.sumTokens({ ownerTokens, blacklistedTokens })
}

module.exports = {
	flow: { tvl }
}
