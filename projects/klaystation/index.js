const { get } = require('../helper/http')
const BigNumber = require("bignumber.js");

//////////    KLAYSTATION   ////////////////
//// TVL = OZYS stakedKlay * priceKlay ////
//////////////////////////////////////////
async function fetch() {
	const klaystationInfo = await get('https://s.klaystation.io/staking/status.json')
	const stakingAmount = klaystationInfo.stakingAmount;
	const priceKlay = klaystationInfo.priceUsd;
	var totalLiquidity = new BigNumber('0');

	const cnAddresses = ["0xe33337cb6fbb68954fe1c3fde2b21f56586632cd"];

	for (const cn of cnAddresses) {
		totalLiquidity = totalLiquidity.plus(stakingAmount[cn]);
	}
	
	totalLiquidity = totalLiquidity.shiftedBy(-18); 
	totalLiquidity = totalLiquidity.multipliedBy(priceKlay);

	return totalLiquidity.toFixed(2);
}

module.exports = {
    methodology: `TVL is equal to the amount of KLAY staked in the Liquiidy Staking pool "OZYS".`,
    timetravel: false,
    misrepresentedTokens: true,
    fetch
} //node test.js projects/klaystation/index.js