const { aaveExports } = require('../helper/aave')

module.exports = {
	pulse: aaveExports(
		'pulse', 
		'0x21597Ae2f941b5022c6E72fd02955B7f3C87f4Cb', 
		undefined, 
		['0x2369cf50ee0e5727bd971c0d2d172ea6f376edaa'], 
		{ v3: true }
	),
}
