const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getV2Reserves, getTvl, getBorrowed, aaveChainTvl } = require('../helper/aave')
const { staking } = require('../helper/staking')
const { unwrapBalancerToken } = require('../helper/unwrapLPs')
const methodologies = require('../helper/methodologies')

const addressesProviderRegistryETH = '0x52D306e36E3B6B02c153d0266ff0f85d18BCD413'

const v3params = [
	'0x770ef9f4fe897e59daCc474EF11238303F9552b6',
	undefined,
	['0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'],
]

function innovationMarketData() {
	let params = v3params
	params = ['0x91b212e9FaF20117Eae59d6289CB38749DDFc070', undefined, ['0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682']]

	const section = (borrowed) => aaveChainTvl('merlin', ...params, borrowed, true)

	const result = {
		tvl: section(false),
		borrowed: section(true),
	}
	// console.log(result)
	return result
}

const aaveTokenAddress = ADDRESSES.ethereum.AAVE

async function stakingBalancerTvl(api) {
	return unwrapBalancerToken({
		api,
		owner: '0xa1116930326d21fb917d5a27f1e9943a9595fb47',
		balancerToken: '0x41a08648c3766f9f9d85598ff102a08f4ef84f84',
		isV2: false,
	})
}

const aaveStakingContract = '0x4da27a545c0c5b758a6ba100e3a049001de870f5'

module.exports = {
	methodology: methodologies.lendingMarket,
	merlin: innovationMarketData(),
}

// node test.js projects/avalon-finance/inno.js
