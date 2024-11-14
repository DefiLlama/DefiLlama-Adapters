const alephium = require("../helper/chain/alephium");

const elexiumTokenId =
	"cad22f7c98f13fe249c25199c61190a9fb4341f8af9b1c17fcff4cd4b2c3d200";
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

async function getPoolTokens(poolId) {
	const poolAddress = alephium.addressFromContractId(poolId);

	const tokenBalance = (await alephium.getTokensBalance(poolAddress)).filter(
		(t) => t.tokenId !== poolId,
	);

	const alphBalance = (await alephium.getAlphBalance(poolAddress)).balance;

	return {
		alph: Number(alphBalance) / 1e18,
		tokens: tokenBalance,
	};
}

async function poolsTvl() {
	const allPools = await getAllPools();

	const tokensMetadata = {};

	const tokensTvl = {
		ALPH: 0,
	};

	for (const pool of allPools) {
		const { alph, tokens } = await getPoolTokens(pool);

		tokensTvl["ALPH"] += alph;

		for (const token of tokens) {
			if (tokensMetadata[token.tokenId] === undefined) {
				const metadata = await alephium.getTokenInfo(token.tokenId);
				tokensMetadata[token.tokenId] = metadata;
			}

			const metadata = tokensMetadata[token.tokenId];

			const tokenAmount =
				Number(token.balance) / 10 ** Number(metadata.decimals);

			if (tokensTvl[metadata.symbol] === undefined) {
				tokensTvl[metadata.symbol] = tokenAmount;
			} else {
				tokensTvl[metadata.symbol] += tokenAmount;
			}
		}
	}

	return tokensTvl;
}

async function veTVL() {
	const tokenBalance = (await alephium.getTokensBalance(veAddress)).find(
		(t) => t.tokenId === elexiumTokenId,
	);

	return Number(tokenBalance.balance) / 1e18;
}

module.exports = {
	timetravel: false,
	methodology:
		"Total value of tokens provided as liquidity on alephium and total amount of locked $EX in voting escrow",
	alephium: { tvl: poolsTvl, staking: veTVL },
};
