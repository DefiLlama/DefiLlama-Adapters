const { sumSingleBalance, TOKEN_LIST, getBalance, } = require('../helper/terra')

// Source: https://docs.loterra.io/resources/contract-addresses
const contracts = {
	multiSig: 'terra1s4twvkqy0eel5saah64wxezpckm7v9535jjshy',
	dogether: 'terra19h4xk8xxxew0ne6fuw0mvuf7ltmjmxjxssj5ts'
}

async function tvl(timestamp, ethBlock, { terra: block }) {
	const balances = {}

	// Add aUST tokens in the multi-sig
	const aUSTBalance = await getBalance(TOKEN_LIST.anchorust, contracts.dogether, block)
	sumSingleBalance(balances, TOKEN_LIST.anchorust, aUSTBalance)

	return balances
}

async function treasury(timestamp, ethBlock, { terra: block }) {
	const balances = {}

	// Add aUST tokens in the multi-sig
	const aUSTBalance = await getBalance(TOKEN_LIST.anchorust, contracts.multiSig, block)
	sumSingleBalance(balances, TOKEN_LIST.anchorust, aUSTBalance)

	return balances
}

module.exports = {
	methodology: 'TVL counts the UST that is available as a prize on the protocol.',
	terra: {
		tvl,
		treasury,
	},
	timetravel: false,
}