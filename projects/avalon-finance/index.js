
const {  aaveExports } = require('../helper/aave')
const methodologies = require('../helper/methodologies')
const { mergeExports } = require('../helper/utils')

const mainMarket = {
	merlin: aaveExports('', '0x6aB5d5E96aC59f66baB57450275cc16961219796', undefined, ['0x5F314b36412765f3E1016632fD1Ad528929536CA'], { v3: true }),
}
const innovativeMarket = {
	merlin: aaveExports('', '0x91b212e9FaF20117Eae59d6289CB38749DDFc070', undefined, ['0x883cb2E2d9c5D4D9aF5b0d37fc39Fa2284405682'], { v3: true }),
}

module.exports = mergeExports(mainMarket, innovativeMarket)
module.exports.methodology = methodologies.lendingMarket