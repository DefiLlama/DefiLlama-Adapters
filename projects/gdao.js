const ADDRESSES = require('./helper/coreAssets.json')
const { sumTokens } = require('./helper/unwrapLPs');
const { staking } = require('./helper/staking');

const liquidityMinesAddress = '0x4DaC3e07316D2A31baABb252D89663deE8F76f09';
const loyaltyMineAddress = '0xda58927f4065f1d02a6ea850c2aac49d7362a643';

const stakedTokens = [
	ADDRESSES.ethereum.LINK, //link
	ADDRESSES.ethereum.UNI, //uni
	ADDRESSES.ethereum.AAVE, //aave
	ADDRESSES.ethereum.WBTC, //wbtc
	ADDRESSES.ethereum.WETH, //weth
	ADDRESSES.ethereum.SNX, //snx
	ADDRESSES.ethereum.USDC, //usdc
	ADDRESSES.ethereum.YFI, //yfi
];

const GDAOLP = '0x4d184bf6f805ee839517164d301f0c4e5d25c374';
const gdaoToken = '0x515d7E9D75E2b76DB60F8a051Cd890eBa23286Bc';

async function tvl(ts, block) {
	const balances = {}
	const tao = stakedTokens.map(t => [t, liquidityMinesAddress])
	return sumTokens(balances, tao, block)
}


module.exports = {
	methodology: 'TVL counts tokens deposited in the Liquidity Mining program.',
  ethereum: {
    tvl,
		staking: staking(loyaltyMineAddress, gdaoToken),
		pool2: staking(loyaltyMineAddress, GDAOLP),
  }
}
