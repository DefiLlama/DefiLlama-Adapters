const { default: BigNumber } = require("bignumber.js");
const { queryContract } = require("../helper/chain/cosmos");

const HYPERION_FACTORY_ADDRESS =
	"titan1g4xlpqy29m50j5y69reguae328tc9y83l4299pf2wmjn0xczq5jsd2hhhu";

const CONFIG = {
	titan: {
		atkx: {
			coinGeckoId: "tokenize-xchange",
			decimals: 18,
		},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/usdc":
			{
				coinGeckoId: "usd-coin",
				decimals: 6,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/usdt":
			{
				coinGeckoId: "tether",
				decimals: 6,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/eth":
			{
				coinGeckoId: "ethereum",
				decimals: 18,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/sol":
			{
				coinGeckoId: "solana",
				decimals: 9,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/meow":
			{
				coinGeckoId: "meow",
				decimals: 8,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/oracler":
			{
				coinGeckoId: "oracler-ai",
				decimals: 6,
			},
		"factory/titan1pvrwmjuusn9wh34j7y520g8gumuy9xtl3gvprlljfdpwju3x7ucsgehpjy/monkeys":
			{
				coinGeckoId: "monkeys-2",
				decimals: 6,
			},
		"factory/titan1eyfccmjm6732k7wp4p6gdjwhxjwsvje44j0hfx8nkgrm8fs7vqfsalaj2e/wbtc":
			{
				coinGeckoId: "bitcoin",
				decimals: 8,
			},
	},
};

/**
 * For now, we have only a few pairs. So offset is not needed.
 * Also the contract is not paginated.
 * TODO: Use offset when the contract supports pagination
 */
async function _getPairs(offset, limit) {
	try {
		const { pairs } = await queryContract({
			contract: HYPERION_FACTORY_ADDRESS,
			data: {
				pairs: { limit: limit },
			},
			chain: "titan",
		});

		if (!pairs || !Array.isArray(pairs)) {
			throw new Error("Invalid pairs data received from contract");
		}

		return pairs.map((pair) => ({
			poolAddress: pair.contract_addr,
			token0:
				pair.asset_infos[0].native_token.denom ||
				pair.asset_infos[0].token.contract_addr,
			token1:
				pair.asset_infos[1].native_token.denom ||
				pair.asset_infos[1].token.contract_addr,
		}));
	} catch (error) {
		console.error("Error fetching pairs:", error);
		throw error;
	}
}

async function _getPoolInfo(contract) {
	const poolInfo = await queryContract({
		contract: contract,
		data: {
			pool: {},
		},
		chain: "titan",
	});

	const asset0Denom =
		poolInfo.assets[0].info?.native_token?.denom ||
		poolInfo.assets[0].info?.token?.contract_addr;
	const asset1Denom =
		poolInfo.assets[1].info?.native_token?.denom ||
		poolInfo.assets[1].info?.token?.contract_addr;

	return {
		[asset0Denom]: poolInfo.assets[0].amount,
		[asset1Denom]: poolInfo.assets[1].amount,
	};
}

function _getTokenBalance(tokenDenom, rawAmount, balances) {
	const tokenInfo = CONFIG.titan[tokenDenom];

	if (tokenInfo) {
		const tokenAmount = new BigNumber(rawAmount)
			.dividedBy(new BigNumber(10).pow(tokenInfo.decimals))
			.toNumber();

		balances[tokenInfo.coinGeckoId] =
			(balances[tokenInfo.coinGeckoId] || 0) + tokenAmount;
	}

	return balances;
}

async function getAllPairs() {
	let offset = 0;
	let limit = 100;
	let pairs = [];
	let data = await _getPairs(offset, limit);

	if (data.length !== 0) {
		pairs = pairs.concat(data);
	}

	// For now, we only have a few pairs (<100)
	// TODO: uncomment this and add pagination offset
	// while (data.length === limit) {
	// 	offset += limit;
	// 	data = await _getPairs(offset, limit);
	// 	pairs = pairs.concat(data);
	// }

	return pairs;
}

async function tvl(api) {
	const pairs = await getAllPairs();
	let balances = {};

	for (const pair of pairs) {
		const poolInfo = await _getPoolInfo(pair.poolAddress);
		if (poolInfo[pair.token0]) {
			balances = _getTokenBalance(pair.token0, poolInfo[pair.token0], balances);
		}
		if (poolInfo[pair.token1]) {
			balances = _getTokenBalance(pair.token1, poolInfo[pair.token1], balances);
		}
	}

	Object.entries(balances).forEach(([coinGeckoId, amount]) => {
		api.addCGToken(coinGeckoId, amount);
	});

	return balances;
}

module.exports = {
	methodology: "Counts the total liquidity in all pools on Hyperion.",
	titan: {
		tvl,
	},
};
