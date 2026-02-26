// Denario Silver Coin and GOld Coin is 100% backed by physical silver and Gold.
// Denario tokens are priced by DefiLlama's server-side RWA adapter.
// This adapter only returns raw token supplies.

const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')

const silverAddress = ADDRESSES.polygon.DSC
const goldAddress = ADDRESSES.polygon.DGC


const firstBlock = 62270459

async function tvl(api) {

	const [totalSilverSupply, totalGoldSupply] = await Promise.all([
	api.call({
		abi: 'erc20:totalSupply',
		target: silverAddress,
	}),
	api.call({
	  abi: 'erc20:totalSupply',
	  target: goldAddress,
	})
  ])

	
	return {
		[silverAddress]: totalSilverSupply,
		[goldAddress]: totalGoldSupply,
	}
}

module.exports = {
	methodology: 'TVL corresponds to the total amount of token minted, which is 100% backed by physical metal.',
	start: firstBlock,
	polygon: {
		tvl,
	}
}
