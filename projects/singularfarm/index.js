const { sumTokens2 } = require("../helper/unwrapLPs");
const abiGeneral = require("../helper/abis/masterchef.json");

const SINGTOKEN = {
	avax: "0xF9A075C9647e91410bF6C402bDF166e1540f67F0",
	bsc: "0x23894C0ce2d79B79Ea33A4D02e67ae843Ef6e563",
	polygon: "0xCB898b0eFb084Df14dd8E018dA37B4d0f06aB26D",
	fantom: "0x53D831e1db0947c74e8a52618f662209ec5dE0cE",
};

const masterChef = {
	avax: "0xF2599B0c7cA1e3c050209f3619F09b6daE002857",
	bsc: "0x31B05a72037E91B86393a0f935fE7094141ba0a7",
	polygon: "0x9762Fe3ef5502dF432de41E7765b0ccC90E02e92",
	fantom: "0x9ED04B13AB6cae27ee397ee16452AdC15d9d561E",
};
const abi = {
  "poolInfo": "function poolInfo(uint256) view returns (address lpToken, uint256 allocPoint, uint256 lastRewardTime, uint256 accSingPerShare, uint16 depositFeeBP, uint256 totalcap, bool isStrat, uint256 stratId, uint256 stratFee, uint256 earned, uint256 accEarnPerShare)"
}

async function tvl(api) {
	const poolInfo = await api.fetchList({  lengthAbi: abiGeneral.poolLength, itemAbi: abi.poolInfo, target: masterChef[api.chain], });
	poolInfo.forEach((pool) => api.add(pool.lpToken, pool.totalcap));
	await sumTokens2({ api, resolveLP: true, })	
	api.removeTokenBalance(SINGTOKEN[api.chain]);
}

module.exports = {
	methodology:
		"Only staked LP is counted as TVL. Excluded in TVL : Locked SING in the bank, meltingpot, value of BNB & xJOE which aren't on CoinGecko yet.",
	avax: { tvl, },
	bsc: { tvl, },
	polygon: { tvl, },
	fantom: { tvl, },
};
