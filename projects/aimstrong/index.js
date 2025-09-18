const abi = {
	getReservesList: "function getReservesList() view returns (address[])",
	getReserveData:
		"function getReserveData(address asset) view returns (uint256,uint128,uint128,uint128,uint128,uint40,address,address,address,uint8)",
};

const CONFIG = {
	arbitrum: "0x7c94606f2240E61E242D14Ed984Aa38FA4C79c0C",
	base: "0x7c94606f2240E61E242D14Ed984Aa38FA4C79c0C",
};

async function tvl(api) {
	const pool = CONFIG[api.chain];
	const reserves = await api.call({ target: pool, abi: abi.getReservesList });
	const datas = await api.multiCall({
		abi: abi.getReserveData,
		calls: reserves.map((r) => ({ target: pool, params: [r] })),
	});
	const tokensAndOwners = reserves.map((reserve, i) => [reserve, datas[i][6]]); // [6] = tTokenAddress
	return api.sumTokens({ tokensAndOwners });
}

async function borrowed(api) {
	const pool = CONFIG[api.chain];
	const reserves = await api.call({ target: pool, abi: abi.getReservesList });

	const datas = await api.multiCall({
		abi: abi.getReserveData,
		calls: reserves.map((r) => ({ target: pool, params: [r] })),
	});

	const supplies = await api.multiCall({
		abi: "erc20:totalSupply",
		calls: datas.map((d) => ({ target: d[7] })), // [7] = variableDebtTokenAddress
	});

	reserves.forEach((underlying, i) => {
		api.add(underlying, supplies[i]);
	});

	return api.getBalances();
}

module.exports = {
	methodology:
		"TVL is the sum of collateral tokens backing the protocol, by checking balances held in each reserve’s tToken.",
	arbitrum: { tvl, borrowed },
	base: { tvl, borrowed },
};
