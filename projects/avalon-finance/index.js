const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { getV2Reserves, getTvl, getBorrowed, aaveChainTvl } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

const v3params = [
	'0x770ef9f4fe897e59daCc474EF11238303F9552b6',
	undefined,
	['0x69FA688f1Dc47d4B5d8029D5a35FB7a548310654'],
]

function mainMarketData() {
	let params = v3params

	params = ['0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA']]

	const section_main = (borrowed) => aaveChainTvl('merlin', ...params, borrowed, true)

	const result = {
		tvl: section_main(false),
		borrowed: section_main(true),
	}
	// console.log(result)
	return result
}

function innovationMarketData() {
	let params = v3params
	params = ['0x91b212e9FaF20117Eae59d6289CB38749DDFc070', undefined, ['0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682']]

	const section_inno = (borrowed) => aaveChainTvl('merlin', ...params, borrowed, true)

	const result = {
		tvl: section_inno(false),
		borrowed: section_inno(true),
	}
	// console.log(result)
	return result
}

module.exports = {
	merlin: mainMarketData(),
}

// node test.js projects/avalon-finance/index.js
