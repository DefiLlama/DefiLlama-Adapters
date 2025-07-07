const { queryContract, sumTokens } = require("../helper/chain/cosmos");

const HYPERION_FACTORY_ADDRESS = "titan1g4xlpqy29m50j5y69reguae328tc9y83l4299pf2wmjn0xczq5jsd2hhhu";

async function _getPairs(offset = 0, limit = 100, api) {
	const { pairs } = await queryContract({ contract: HYPERION_FACTORY_ADDRESS, data: { pairs: { limit, offset } }, api });
	return pairs.map((pair) => pair.contract_addr);
}

const tvl = async (api) => {
	let offset = 0;
	const limit = 100;
	let pairs = [];
	let hasMore = true;

	while (hasMore) {
		const data = await _getPairs(offset, limit, api);
		pairs.push(...data);
		if (data.length < limit) break;
		offset += limit;
	}

	return sumTokens({ owners: pairs, api });
}

module.exports = {
	methodology: "Counts the total liquidity in all pools on Hyperion.",
	titan: { tvl }
}