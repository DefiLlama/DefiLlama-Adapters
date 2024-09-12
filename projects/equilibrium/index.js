const { getExports } = require('../helper/heroku-api')

module.exports = {
	hallmarks: [[1714550400, 'Sunset of Equilibrium Network']],
	deadFrom: "2024-09-01",
	timetravel: false,
	...getExports("equilibrium", ['equilibrium'])
}