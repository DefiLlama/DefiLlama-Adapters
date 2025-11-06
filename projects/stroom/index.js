const sdk = require('@defillama/sdk')

const POR_ORACLE = '0x12DB8fcA6AAA29E922bFAD8a7771aE11F17a1811'
const abi = {
	getCombinedReserveValue: 'function getCombinedReserveValue() view returns (uint256)',
}

async function tvl() {
	const ethApi = new sdk.ChainApi({ chain: 'ethereum' })
	const satoshis = await ethApi.call({ 
    abi: abi.getCombinedReserveValue, 
    target: POR_ORACLE 
  })
	const btc = Number(satoshis) / 1e8
	return { 'coingecko:bitcoin': btc }
}

module.exports = {
	timetravel: false,
	methodology: 'TVL equals BTC reserves tracked on Bitcoin. We read the aggregated reserve value from Stroom\'s on-chain PoR oracle on Ethereum (denominated in satoshis), divide by 1e8 to get BTC, and report it as bitcoin (USD pricing from BTC).',
	bitcoin: { tvl },
}
