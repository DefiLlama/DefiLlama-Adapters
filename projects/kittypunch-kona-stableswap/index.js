async function tvl(api) {
	const factories = Object.values({
    "CurveStableswapFactoryNG": "0x288E195322088E615460ccAa0FE0a862C9E06412",
    "CurveTwocryptoFactoryNG": "0x9f9F76660d17f76F63a32f6d4920B282d3856f3f",
    "CurveTricryptoFactoryNG": "0xA44965EbBcb73163EB838Dc4DFa85F56B04804A6",
	})
	const ownerTokens = []
	const blacklistedTokens = []
	for (const factory of factories) {
		const pools = await api.fetchList({ lengthAbi: 'pool_count', itemAbi: 'pool_list', target: factory, })
		let res = 'address[]'
		if (factory === '0x9f9F76660d17f76F63a32f6d4920B282d3856f3f') res = 'address[2]'
		if (factory === '0xA44965EbBcb73163EB838Dc4DFa85F56B04804A6') res = 'address[3]'
		const tokens = await api.multiCall({ abi: 'function get_coins(address) view returns (' + res + ')', calls: pools, target: factory, })
		blacklistedTokens.push(...pools)
		ownerTokens.push(...tokens.map((t, i) => [t, pools[i]]))
	}
	return api.sumTokens({ ownerTokens, blacklistedTokens })
}

module.exports = {
	abstract: { tvl }
}
