const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const controller = '0xC537e898CD774e2dCBa3B14Ea6f34C93d5eA45e1'

async function tvl(api) {
	const logs = await getLogs({
		api,
		target: controller,
		topic: 'PairCreated(uint128,address,address)',
		eventAbi: 'event PairCreated(uint128 indexed pairId, address indexed token0, address indexed token1)',
		onlyArgs: true,
		fromBlock: 17087375,
	})
	const tokens = logs.map(i => [i.token0, i.token1]).flat()

	return sumTokens2({ api, owner: controller, tokens, })
}


module.exports = { ethereum: { tvl } }