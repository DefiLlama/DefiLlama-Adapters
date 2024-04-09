const BigNumber = require("bignumber.js");

const wzetaTroveManager = '0x3aC3d90dc8cB1Cacf1Fd8bc07e4B76c5EA443279'
const zbrUSD = '0x5d8Dc3b34D7B07BB09495c480AD629900c0A2e02'
const wzeta = '0x5F0b1a82749cb4E2278EC87F8BF6B618dC71a8bf'

async function tvl(api) {
	const getEntireSystemColl = await api.call({ target: wzetaTroveManager, abi: "function getEntireSystemColl() public view returns (uint256)" })
	const price = await api.call({ target: wzetaTroveManager, abi: "function fetchPrice() external returns (uint256)" })
	const totalSupply = await api.call({ target: zbrUSD, abi: "function totalSupply() public view returns (uint256)" })
	// zbrUSD price is not available currently, using equivalent WZeta instead
	const collBalance = new BigNumber(getEntireSystemColl)
	const zbrUSDBalance = new BigNumber(totalSupply).multipliedBy(1e18).div(price)
	api.addTokens([wzeta], [collBalance.plus(zbrUSDBalance).toFixed(0)])
}

module.exports = {
	start: 2197820,
	misrepresentedTokens: true,
	methodology: "TVL = TVL(Collateral) + toatalDebt(Supply of zbrUSD)",
	timetravel: true,
	zeta: {
		tvl
	}
};