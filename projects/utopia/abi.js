const abi = Object.freeze({
	getBalance: {
		name: 'getBalance',
		type: 'function',
		stateMutability: 'view',
		inputs: [],
		outputs: [{ type: 'uint256', name: '' }],
	},
});

module.exports = { abi };
