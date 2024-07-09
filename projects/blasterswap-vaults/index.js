const config = {
	blast: {
		pools: {
			"xBlast": "0x0464a36beCf9967111D2dCAb57CAf4a2376f6E3F",
		}, fromBlock: 5692576,
	},
}


Object.keys(config).forEach(chain => {
	let { pools, fromBlock, tokens = [], } = config[chain]
	pools = Object.values(pools)
	module.exports[chain] = {
		tvl: async (api) => {
			return api.erc4626Sum({ calls: pools[0], isOG4626: true, });
		}
	}
})
