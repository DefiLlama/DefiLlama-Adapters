const { nullAddress } = require("../helper/tokenMapping");

const UNIETH_TOKEN = '0xf1376bcef0f78459c0ed0ba5ddce976f1ddf51f4';
const UNIETH_STAKING = "0x4beFa2aA9c305238AA3E0b5D17eB20C045269E9d";

async function tvl(api) {
	const totalSupply = await api.call({
		abi: 'erc20:totalSupply',
		target: UNIETH_TOKEN,
	});

	const exchangeRatio = await api.call({
		abi: 'function exchangeRatio() external view returns (uint256)',
		target: UNIETH_STAKING,
	});

	api.add(nullAddress, totalSupply * exchangeRatio / 1e18)
}

module.exports = {
	doublecounted: true,
	methodology: 'Counts the total ethers staked with RockX Staking Contract.',
	ethereum: {
		tvl,
	}
};
