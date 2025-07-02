const { queryContract, sumTokens } = require("../helper/chain/cosmos");

const HYPERION_FACTORY_ADDRESS = "titan1g4xlpqy29m50j5y69reguae328tc9y83l4299pf2wmjn0xczq5jsd2hhhu";

async function tvl(api) {
	let offset = 0;
	let limit = 100;
	let pairs = [];
	do {
		const data = await _getPairs(offset, limit);
		pairs = pairs.concat(data);
		if (data.length < limit) break; // Exit if no more pairs are found
		offset += limit; // Increment offset for next batch
	} while (true)

	return sumTokens({ owners: pairs, api, })

	async function _getPairs(offset = 0, limit = 100) {
		const { pairs } = await queryContract({
			contract: HYPERION_FACTORY_ADDRESS,
			data: { pairs: { limit, offset, }, },
			api,
		});

		return pairs.map((pair) => pair.contract_addr);
	}
}

module.exports = {
	methodology: "Counts the total liquidity in all pools on Hyperion.",
	titan: {
		tvl,
	},
};
