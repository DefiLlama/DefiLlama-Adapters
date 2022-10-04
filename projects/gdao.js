const { sumTokens } = require('./helper/unwrapLPs');
const { pool2 } = require('./helper/pool2');
const { staking } = require('./helper/staking');

const liquidityMinesAddress = '0x4DaC3e07316D2A31baABb252D89663deE8F76f09';
const loyaltyMineAddress = '0xda58927f4065f1d02a6ea850c2aac49d7362a643';

const stakedTokens = [
	'0x514910771af9ca656af840dff83e8264ecf986ca', //link
	'0x1f9840a85d5af5bf1d1762f925bdaddc4201f984', //uni
	'0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9', //aave
	'0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', //wbtc
	'0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', //weth
	'0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', //snx
	'0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', //usdc
	'0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e', //yfi
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
		pool2: pool2(loyaltyMineAddress, GDAOLP),
  }
}
