const { getLogs2 } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
	base: { factory: '0x7e84E0A8799cD13b671D819A86CF38f4F8a20af1', fromBlock: 13689740, lp: '0xcbcd3854cbc7f2ec4af1c99dcb32c393d77abf6c', pod: '0xbef5d404548fab05820e64f92cf043b6a06f9c72' },
}

Object.keys(config).forEach(chain => {
	const { factory, fromBlock, lp, pod } = config[chain]

	async function _getLogs(api, tvlType) {

		const logs = await getLogs2({ api, factory, eventAbi: 'event PodCreated (address indexed underlying, address indexed pod, address owner, uint256 index)', fromBlock, })
		const toa = logs.map(i => [i.underlying.toLowerCase(), i.pod,])
		switch (tvlType) {
			case 'pool2':
				return toa.filter(i => i[0] === lp)
			default:
				return toa.filter(i => i[0] !== lp)
		}

	}
	module.exports[chain] = {
		tvl: () => ({}),
		pool2: async (api) => {
			return sumTokens2({ api, resolveLP: true, tokensAndOwners: await _getLogs(api, 'pool2'), })
		},
		staking: async (api) => {
			return sumTokens2({ api, resolveLP: true, tokensAndOwners: await _getLogs(api, 'staking'), })
		},
	}
})