const {
	postURL
} = require('../helper/utils');

async function getCurrentStake() {
	let postdata = {
		"contract_address": "414b8a2c619bccb710206b3d11e28dce62d8d72a8b",
		"owner_address": "4128fb7be6c95a27217e0e0bff42ca50cd9461cc9f",
		"function_selector": "reservedTRX()",
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
