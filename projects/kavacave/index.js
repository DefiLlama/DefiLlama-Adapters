const abiGeneral = require("../helper/abis/masterchef.json");

const masterChef = {
	kava: "0xf17BBB9698b50156Ee437E01e22D7C2080184934"
};

async function tvl(api) {
	const infos = await api.fetchList({ lengthAbi: abiGeneral.poolLength, itemAbi: abiGeneral.poolInfo, target: masterChef.kava })
	const tokens = infos.map(i => i[0]);
	return api.sumTokens({ tokens, owner: masterChef.kava })
}

module.exports = {
	deadFrom: '2022-10-01',
	hallmarks: [
		[1660521600, "incentives not given"]
	],
	methodology:
		"Staked LP is counted as TVL.",
	kava: {
		tvl,
	},
};
