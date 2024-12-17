const { getConfig } = require("../helper/cache");
const { call } = require("../helper/chain/ton");
const { transformDexBalances } = require("../helper/portedTokens");
const { convertIntToAddress, } = require("../helper/chain/utils/ton-address");
const { PromisePool } = require("@supercharge/promise-pool");
const { sleep } = require("../helper/utils");

module.exports = {
	misrepresentedTokens: true,
	timetravel: false,
	ton: {
		tvl: async () => {
			const pools = await getConfig('utyabswap', "https://api.utyabswap.com/v1/pools");
			const getPoolData = async (pool) => {
				const data = await call({ target: pool.address, abi: "get_assets_full", rawStack: true, });

				data.shift().pop();
				const asset0AddressInt = data.shift().pop();
				const asset0Address = convertIntToAddress(BigInt(asset0AddressInt)).toString()
				const asset0Reserve = Number(data.shift().pop())

				data.shift().pop();
				const asset1AddressInt = data.shift().pop();
				const asset1Address = convertIntToAddress(BigInt(asset1AddressInt)).toString()
				const asset1Reserve = Number(data.shift().pop())

				await sleep(1000 * (2 * Math.random() + 2))

				return {
					token0: asset0Address,
					token1: asset1Address,
					token0Bal: asset0Reserve,
					token1Bal: asset1Reserve,
				}
			}

			const { results: data, errors } = await PromisePool.withConcurrency(2).for(pools).process(getPoolData);

			if (errors && errors.length) throw errors[0];

			return transformDexBalances({ chain: "ton", data, });
		},
	},
};
