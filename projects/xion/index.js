const { queryV1Beta1 } = require("../helper/chain/cosmos");

//https://raw.githubusercontent.com/cosmos/chain-registry/refs/heads/master/xion/assetlist.json
//https://api.xion-mainnet-1.burnt.com/cosmos/bank/v1beta1/denoms_metadata
const assetMap = {
	uxion: {
		decimals: 6,
		id: "xion-2",
	},
	"ibc/0471F1C4E7AFD3F07702BEF6DC365268D64570F7C1FDC98EA6098DD6DE59817B": {
		decimals: 6,
		id: "osmo",
	},
	"ibc/056EA54C3D9B49B3C0418955A27980A91DD4F210914BFE240A1DB19E27895ECA": {
		decimals: 6,
		id: "kyve-network",
	},
	"ibc/6490A7EAB61059BFC1CDDEB05917DD70BDF3A611654162A1A47DB930D40D8AF4": {
		decimals: 6,
		id: "axlusdc",
	},
	"ibc/9463E39D230614B313B487836D13A392BD1731928713D4C8427A083627048DB3": {
		decimals: 6,
		id: "axelar",
	},
	"ibc/AAD7136DD626569C3DDE7C5F764968BB2E939875EFC568AE5712B62081850814": {
		decimals: 18,
		id: "axlweth",
	},
	"ibc/DBE9697AC1044255A305A2034AD360B4152632BFBFB5785234731F60196B9645": {
		decimals: 6,
		id: "elys-network",
	},
	"ibc/E706A0C6CACB374ADC2BCF6A74FE1B260840FC822E45DCB776DEA962A57FED30": {
		decimals: 18,
		id: "arbitrum",
	},
	"ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349": {
		decimals: 6,
		id: "usd-coin",
	},
};

async function tvl() {
	const supplyData = await queryV1Beta1({
		chain: "xion",
		url: "/bank/v1beta1/supply",
	});
	const balances = {};

	supplyData.supply.forEach(({ denom, amount }) => {
		if (!assetMap[denom]) return;
		const { decimals, id } = assetMap[denom];
		balances[id] = amount / 10 ** decimals;
	});

	return balances;
}

async function staking() {
	const stakingData = await queryV1Beta1({
		chain: "xion",
		url: "/staking/v1beta1/pool",
	});
	return {
		xion: stakingData.pool.bonded_tokens / 10 ** assetMap['uxion'].decimals,
	};
}

module.exports = {
	xion: {
		tvl,
		staking,
	},
};
