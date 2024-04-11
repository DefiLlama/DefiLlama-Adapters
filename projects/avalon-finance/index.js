const { aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')

const merlin_main_market_data = aaveExports('merlin', '0x6aB5d5E96aC59f66baB57450275cc16961219796', {
	v3: true,
})

const merlin_innovation_market_data = aaveExports('merlin', '0x91b212e9FaF20117Eae59d6289CB38749DDFc070', {
	v3: true,
})

module.exports = {
	methodology: methodologies.lendingMarket,
	merlin: {
		tvl: merlin_main_market_data.tvl + merlin_innovation_market_data.tvl,
		borrowed: merlin_main_market_data.borrowed + merlin_innovation_market_data.borrowed,
	},
}
