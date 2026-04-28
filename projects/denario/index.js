const ADDRESSES = require('../helper/coreAssets.json')

const silverAddress = ADDRESSES.polygon.DSC
const goldAddress = ADDRESSES.polygon.DGC
const firstBlock = 62270459

async function tvl(api) {
	const [totalSilverSupply, totalGoldSupply] = await api.multiCall({
		abi: 'erc20:totalSupply',
		calls: [silverAddress, goldAddress],
	})

	api.add(silverAddress, totalSilverSupply)
	api.add(goldAddress, totalGoldSupply)
}

module.exports = {
	methodology: 'TVL corresponds to the total amount of DSC and DGC tokens minted, each 100% backed by physical silver and gold respectively.',
	start: firstBlock,
	polygon: {
		tvl,
	}
}
