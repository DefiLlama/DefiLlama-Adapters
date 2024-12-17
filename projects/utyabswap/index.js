const { get, post } = require("../helper/http");
const { transformDexBalances } = require("../helper/portedTokens");
const { convertIntToAddress, compareAddress } = require("./address-utils");

async function callRaw({ target, abi, params = [] }) {
	const requestBody = {
		address: target,
		method: abi,
		stack: params,
	};
	const { ok, result } = await post(
		"https://toncenter.com/api/v2/runGetMethod",
		requestBody
	);
	if (!ok) {
		throw new Error("Unknown");
	}

	const { exit_code, stack } = result;

	if (exit_code !== 0) {
		throw new Error("Expected a zero exit code, but got " + exit_code);
	}

	return stack;
}

module.exports = {
	misrepresentedTokens: true,
	timetravel: false,
	ton: {
		tvl: async () => {
			const result = await get("https://api.utyabswap.com/v1/pools");

			const mappedPools = result.map(async (pool) => {
				if (!pool.token0 || !pool.token1) return null;

				let token0Reserve;
				let token1Reserve;

				try {
					const data = await callRaw({
						target: pool.address,
						abi: "get_assets_full",
					});

					data.shift().pop();
					const asset0AddressInt = data.shift().pop();
					const asset0Address = convertIntToAddress(
						BigInt(asset0AddressInt)
					);
					const asset0Reserve = Number(data.shift().pop())

					data.shift().pop();
					const asset1AddressInt = data.shift().pop();
					const asset1Address = convertIntToAddress(
						BigInt(asset1AddressInt)
					);
					const asset1Reserve = Number(data.shift().pop())

					token0Reserve = compareAddress(
						asset0Address,
						pool.token0.address
					)
						? asset0Reserve
						: asset1Reserve;
					token1Reserve = compareAddress(
						asset1Address,
						pool.token1.address
					)
						? asset1Reserve
						: asset0Reserve;
				} catch (error) {
					console.error(
						"Error executing method or reading data:",
						error
					);
					return null;
				}

				return {
					id: pool.id,
					address: pool.address,
					token0: {
						symbol: pool.token0.symbol,
						name: pool.token0.name,
						decimals: pool.token0.decimals,
						address: pool.token0.address,
						reserve: token0Reserve,
					},
					token1: {
						symbol: pool.token1.symbol,
						name: pool.token1.name,
						decimals: pool.token1.decimals,
						address: pool.token1.address,
						reserve: token1Reserve,
					},
				};
			});

			const resolvedPools = await Promise.all(mappedPools);

			return transformDexBalances({
				chain: "ton",
				data: resolvedPools.map((i) => ({
					token0: i.token0.address,
					token1: i.token1.address,
					token0Bal: i.token0.reserve,
					token1Bal: i.token1.reserve,
				})),
			});
		},
	},
};
