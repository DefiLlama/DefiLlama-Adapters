const { get } = require('../helper/http')
// const { kamino } = require("../helper/chain/rpcProxy")

module.exports = {
	doublecounted: true,
	timetravel: false,
	misrepresentedTokens: true,
	solana: { tvl }
}

async function tvl(api) {
	const data = await get('https://api.kamino.finance/strategies/metrics?env=mainnet-beta')
	data.forEach((i => {
		if (i.tokenA === 'GECKO' || i.tokenB === 'GECKO') return; // skip GECKO, it has incorrect price
		if (+i.totalValueLocked > 1e8) console.log(i)
		api.addUSDValue(+i.totalValueLocked)
	}))
	// api.addUSDValue(await kamino.tvl())
}