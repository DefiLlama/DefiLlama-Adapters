
const { kamino } = require("../helper/chain/rpcProxy")

module.exports = {
	doublecounted: true,
	timetravel: false,
	misrepresentedTokens: true,
	solana: { tvl }
}

async function tvl(api) {
	api.addUSDValue(await kamino.tvl())
}