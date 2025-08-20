const ADDRESSES = require("../helper/coreAssets.json");
const { post } = require('../helper/http');

const { getEnv } = require('../helper/env')
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const addresses = [
	'TKoffapJgw2E586kp9taJvjqdfpiKrWKWG',
	'TSmrfRFesHf9of94mNKLgrunbFzrPYGiPZ',
	'TYEMUMKBmkTRMa1CNh7xkNYZ2mTVFw9f1a',
	'TQmxShUFhs8bHxdQKeWWFNPYJJp5mzUz38',
	'TXtt43tfe6SUL8HU6KNutXNm4Ybuj1Ro25',
	'TGinDyFgTLYcnoJtFatxictWB1dfN6no26'
]

async function callApi(api, body) {
	return await post(getEnv('TRON_RPC') + api, body)
}
async function getDelegatedAmountSun(from, to) {
	const data = await callApi('/wallet/getdelegatedresourcev2', {
		fromAddress: from,
		toAddress: to,
		visible: true
	})
	const list = data.delegatedResource || [];
	let bw = 0, en = 0;
	for (const it of list) {
		bw += Number(it.frozen_balance_for_bandwidth || 0);
		en += Number(it.frozen_balance_for_energy || 0);
	}
	return bw + en
}

async function sumOneAddress(to) {
	const response = await callApi('/wallet/getdelegatedresourceaccountindexv2', {
		value: to,
		visible: true
	})
	const perRequestDelayMs = 100
	// console.log(response)
	let totalSun = 0;
	for (const from of response.fromAccounts) {
		const a = await getDelegatedAmountSun(from, to);
		// console.log("sum from to ",from,to,a)
		totalSun += a || 0;
		if (perRequestDelayMs > 0) await sleep(perRequestDelayMs);
	}
	// console.log("totalSun:",totalSun)
	return totalSun
}
async function getStakedTron() {
	let total = 0
	for (const address of addresses) {
		total += await sumOneAddress(address)
	}
	return total / 1000_000
}


module.exports = {
	tron: {
		tvl: async () => {
			return {
				tron: await getStakedTron(),
			};
		},
	},
	timetravel: false,
};
