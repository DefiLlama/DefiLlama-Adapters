const sdk = require('@defillama/sdk');
const BigNumber = require('bignumber.js');

const ALI_TOKEN_ADDRESS = '0x6B0b3a982b4634aC68dD83a4DBF02311cE324181';

const reserves = {
	'Ecosystem Development Reserve': '0x26aAf7491588d4fF1146523917Fb196B307603C8',
	'Private and Strategic Sale Reserve': '0x562B3143b566920becAb5f477C1c55c0FCBEcDDd',
	'Team and Advisor Reserve': '0x5c17ed4B16672Fd134b9046957e3FE68A7e8A139',
	'Marketing Reserve': '0x6244b5c1E3056298055df674dA546e319711afA8',
	'Treasury Reserve': '0x46d608d34D1d4e94Eb15329747ceF7E5f5854C00'
};

async function tvl() {
	let totalBalance = new BigNumber(0);

	for (const [name, address] of Object.entries(reserves)) {
		const balance = await sdk.api.erc20.balanceOf({
			target: ALI_TOKEN_ADDRESS,
			owner: address
		});

		totalBalance = totalBalance.plus(new BigNumber(balance.output));
	}

	return {
		'0x6B0b3a982b4634aC68dD83a4DBF02311cE324181': totalBalance.toString()
	};
}

module.exports = {
	methodology: 'TVL accounts for the ALI token balances held in the listed reserves.',
	ethereum: {
		tvl,
	},
};
