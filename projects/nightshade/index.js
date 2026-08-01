const alephium = require("../helper/chain/alephium");

const nightshadeAddress = "24pPSeXvbmUjM6NZVYehEjLiCDDDeT94CR9rp1YJSuxKZ";


async function getTvl(api) {
	const results = await alephium.contractMultiCall([
		{ group: 0, address: nightshadeAddress, methodIndex: 2 },
	]);
	const pairsCount = Number(results[0].returns[0].value);

	for (let i = 0; i < pairsCount - 1; i++) {
		const pairResult = await alephium.contractMultiCall([
			{
				group: 0,
				address: nightshadeAddress,
				methodIndex: 0,
				args: [{ value: i, type: "U256" }],
			},
			{
				group: 0,
				address: nightshadeAddress,
				methodIndex: 8,
				args: [{ value: i, type: "U256" }],
			},
		]);


		const firstTokenId = pairResult[0].returns[0].value;
		const secondTokenId = pairResult[0].returns[1].value;

		const balances = pairResult[1].returns;
		const firstTokenBalance = balances[8].value;
		const secondTokenBalance = balances[9].value;

		api.add(firstTokenId, firstTokenBalance);
		api.add(secondTokenId, secondTokenBalance);
	}
}

module.exports = {
	timetravel: false,
	methodology:
		"Total value of tokens provided as liquidity on Alephium",
	alephium: { tvl: getTvl },
};
