const sdk = require("@defillama/sdk");
const { transformFantomAddress } = require('../helper/portedTokens');
const { unwrapUniswapLPs, sumTokens } = require('../helper/unwrapLPs');
const abis = require("./abis.json");

const SOLID = '0x888EF71766ca594DED1F0FA3AE64eD2941740A20';


async function tvl(timestamp, block, chainBlocks) {
	const balances = {};

	const noPairs = (await sdk.api.abi.call({
		target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
		abi: abis.allPairsLength,
		block: chainBlocks.fantom,
		chain: 'fantom'
	})).output;

	const pairAddresses = (await sdk.api.abi.multiCall({
		target: '0x3fAaB499b519fdC5819e3D7ed0C26111904cbc28',
		calls: Array.from({ length: Number(noPairs) }, (_, k) => ({
			params: k,
		})),
		abi: abis.allPairs,
		block: chainBlocks.fantom,
		chain: 'fantom'
	})).output;

	let pairTokens = (await sdk.api.abi.multiCall({
		calls: pairAddresses.map(a => ({
			target: a.output
		})),
		abi: abis.tokens,
		block: chainBlocks.fantom,
		chain: 'fantom'
	})).output;

	let tokensAndOwners = [];
	for (let i = 0; i < pairTokens.length; i++) {
		const owner = pairTokens[i].input.target;
		(pairTokens[i].output || []).forEach(token => tokensAndOwners.push([token, owner]))
	}

	await sumTokens(balances, tokensAndOwners, chainBlocks.fantom, 'fantom',);

	return balances;
}

async function staking(ts, _block, chainBlocks) {
	const balances = {};
	balances[`fantom:${SOLID}`] = (await sdk.api.abi.call({
		target: '0xcbd8fea77c2452255f59743f55a3ea9d83b3c72b',
		abi: abis.locked,
		params: [8],
		block: chainBlocks.fantom,
		chain: 'fantom'
	})).output.amount
	return balances
}

module.exports = {
	doublecounted: true,
	fantom: {
		tvl,
		staking,
	}
};
