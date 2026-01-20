const { get } = require('../helper/http')
// const { kamino } = require("../helper/chain/rpcProxy")

module.exports = {
	doublecounted: true,
	timetravel: false,
	misrepresentedTokens: true,
	solana: { tvl }
}

const excludedTokenSet = new Set(['GECKO', 'PEEP'])

async function tvl(api) {
	const data = await get('https://api.kamino.finance/strategies/metrics?env=mainnet-beta')
	data.forEach((i => {
		if (excludedTokenSet.has(i.tokenA) || excludedTokenSet.has(i.tokenB)) return;
		if (+i.totalValueLocked > 1e8) console.log(i)
		api.addUSDValue(+i.totalValueLocked)
	}))
	// api.addUSDValue(await kamino.tvl())
}