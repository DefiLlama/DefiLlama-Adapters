const { eurxb } = require('./abis/eurxb.js');
const { bond } = require('./abis/bond.js');
const { sat } = require('./abis/sat.js');

let abis = {
	eurxb,
	bond,
	sat
};

module.exports = { abis };