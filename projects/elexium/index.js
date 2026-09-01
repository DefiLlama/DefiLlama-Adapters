const alephium = require("../helper/chain/alephium");

const elexiumTokenId = "cad22f7c98f13fe249c25199c61190a9fb4341f8af9b1c17fcff4cd4b2c3d200";
const alephId = '0000000000000000000000000000000000000000000000000000000000000000'
const veAddress = "23XEjbtTNN2FtcJryavvfMf6VwgVK22uiw5T6N85kjFzX";
const pairFactoryAddress = "22oTtDJEMjNc9QAdmcZarnEzgkAooJp9gZy7RYBisniR5";

async function getAllPools() {
	const results = await alephium.contractMultiCall([
		{ group: 0, address: pairFactoryAddress, methodIndex: 0 },
	]);

	const pairsCount = Number(results[0].returns[0].value);

	const poolIds = [];

	for (let i = 0; i < pairsCount; i++) {
		const results = await alephium.contractMultiCall([
			{
				group: 0,
				address: pairFactoryAddress,
				methodIndex: 2,
				args: [{ value: i, type: "U256" }],
			},
		]);

		const poolId = results[0].returns[0].value;

		poolIds.push(poolId);
	}

	return poolIds;
}

async function addPoolTokens(poolId, api) {
	const poolAddress = alephium.addressFromContractId(poolId);

	const tokenBalance = (await alephium.getTokensBalance(poolAddress)).filter(
		(t) => t.tokenId !== poolId,
	);

	tokenBalance.forEach(i => api.add(i.tokenId, i.balance));

	const alphBalance = (await alephium.getAlphBalance(poolAddress)).balance;
	api.add(alephId, alphBalance);
}

async function poolsTvl(api) {
	const allPools = await getAllPools()

	for (const pool of allPools)
		await addPoolTokens(pool, api);
}

async function veTVL(api) {
	const tokenBalance = (await alephium.getTokensBalance(veAddress)).find((t) => t.tokenId === elexiumTokenId,) ?? { balance: 0 };
	api.add(elexiumTokenId, tokenBalance.balance);
}

module.exports = {
	timetravel: false,
	methodology:
		"Total value of tokens provided as liquidity on alephium and total amount of locked $EX in voting escrow",
	alephium: { tvl: poolsTvl, staking: veTVL },
};
