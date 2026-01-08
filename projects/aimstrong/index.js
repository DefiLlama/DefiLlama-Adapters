const ADDRESSES = require('../helper/coreAssets.json')
const abi = {
	getReservesList: "function getReservesList() view returns (address[])",
	getReserveData:
		"function getReserveData(address asset) view returns (uint256,uint128,uint128,uint128,uint128,uint40,address,address,address,uint8)",
};

const CONFIG = {
	arbitrum: "0x7c94606f2240E61E242D14Ed984Aa38FA4C79c0C",
	base: "0x7c94606f2240E61E242D14Ed984Aa38FA4C79c0C",
	bsc: "0xA0a61cFa5798976b0064fBbFfc73dc81080d929F",
};

async function tvl(api) {
	if (api.chain === "zeta") {
		const treasury = "0x18351419aE86F3DD3128943ec01b873b4f35801D";
		const tokens = [
			"0x1de70f3e971B62A0707dA18100392af14f7fB677",
			"0xA614Aebf7924A3Eb4D066aDCA5595E4980407f1d",
			ADDRESSES.zeta.BNB,
		];
		const tokensAndOwners = tokens.map((t) => [t, treasury]);
		return api.sumTokens({ tokensAndOwners });
	}

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
	bsc: { tvl, borrowed },
	zeta: { tvl },
};