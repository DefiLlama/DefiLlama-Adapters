const BN = require("bignumber.js");
const utils = require("./helper/utils");
const { abis } = require("./config/yaxis/abis.js");
const constants = require("./config/yaxis/constants.js");

const web3 = require("./config/web3.js");

async function fetch() {
	// 1. MetaVault
	const metaVault = new web3.eth.Contract(
		abis.yAxisMetaVault,
		constants.METAVAULT
	);
	const threeCrv = await metaVault.methods.balance().call();
	const threeCrvPrice = (await utils.getPricesfromString("lp-3pool-curve"))
		.data["lp-3pool-curve"].usd;
	const metaVaultTVL = new BN(threeCrv).div(10 ** 18).times(threeCrvPrice);

	// 2. sYAX (Legacy)
	const chef = new web3.eth.Contract(abis.yAxisBar, constants.BAR);
	const sYAX = await chef.methods.availableBalance().call();
	const yaxisPrice = (await utils.getPricesfromString("yaxis")).data["yaxis"]
		.usd;
	const sYaxTVL = new BN(sYAX).div(10 ** 18).times(yaxisPrice);
	// sYAXIS
	const yaxisStaking = new web3.eth.Contract(
		abis.Rewards,
		constants.STAKING.YAXIS
	);
	const sYAXIS = await yaxisStaking.methods.totalSupply().call();
	const sYaxisTVL = new BN(sYAXIS).div(10 ** 18).times(yaxisPrice);
	const staked = sYaxTVL.plus(sYaxisTVL);

	// 4. VAULTS
	// vault balance
	// plus
	// amount staked in YaxisChef

	const totalTVL = metaVaultTVL.plus(staked).toFixed(2);
	return totalTVL;
}

module.exports = {
	fetch,
};
