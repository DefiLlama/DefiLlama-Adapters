const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

module.exports = {
	methodology: methodologies.lendingMarket,
	merlin_main_market: aaveExports('merlin', '0x6aB5d5E96aC59f66baB57450275cc16961219796', {
		v3: true,
	}),
	merlin_innovation_market: aaveExports('merlin', '0x91b212e9FaF20117Eae59d6289CB38749DDFc070', {
		v3: true,
	}),
}
