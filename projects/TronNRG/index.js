const {
	postURL
} = require('../helper/utils');

async function getCurrentStake() {
	let postdata = {
		"contract_address": "413346c747c65b7e53d79737dcf106c82cece27a92",
		"owner_address": "417c97da66c8e3c48bbc6ed925fdd8596e50365925",
		"function_selector": "readStaked()",
		"parameter": "",
		"call_value": 0
	};
	let result = await postURL('https://api.trongrid.io/wallet/triggerconstantcontract', postdata);
	let trx = parseInt(result.data.constant_result[0], 16) / 10 ** 6;
	return trx;
}

async function tvl() {
	return {
		"tron": await getCurrentStake()
	}
}

module.exports = {
	tron: {
		tvl,
	},
}
