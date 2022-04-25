const { get } = require('./helper/http')
const { toUSDTBalances } = require('./helper/balances')
const { staking } = require('./helper/staking')

const chainConfig = {
	fantom: {
		woo: '0x6626c47c00f1d87902fc13eecfac3ed06d5e8d8a',
		stakingContract: '0x2Fe5E5D341cFFa606a5d9DA1B6B646a381B0f7ec',
	},
	bsc: {
		woo: '0x4691937a7508860f876c9c0a2a617e7d9e945d4b',
		stakingContract: '0x2AEab1a338bCB1758f71BD5aF40637cEE2085076',
	},
	avax: {
		woo: '0xabc9547b534519ff73921b1fba6e672b5f58d083',
		stakingContract: '0xcd1B9810872aeC66d450c761E93638FB9FE09DB0',
	}
}

const moduleExports = {}

Object.keys(chainConfig).forEach(chain => {
	const { woo, stakingContract } = chainConfig[chain]
	moduleExports[chain] = {
		staking: staking(stakingContract, woo, chain),
		tvl: fetchTVL(chain),
		pool2: fetchTVL(chain, true),
	}
})

function fetchTVL(network, pool2 = false) {
	return async () => {
		let data = await get('https://fi-api.woo.org/yield?network=' + network)
		data = Object.values(data.data.auto_compounding).filter(data => {
			const isWooLP = /LP/i.test(data.symbol) && /WOO/i.test(data.symbol)
			return pool2 ? isWooLP : !isWooLP
		})
		let tvl = 0
		data.forEach(item => {
			tvl += +item.tvl / 10 ** item.decimals
		})
		return toUSDTBalances(tvl)
	}
}

module.exports = {
	timetravel: false,
	...moduleExports,
}
