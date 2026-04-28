// Denario Silver Coin (DSC) and Denario Gold Coin (DGC) are 100% backed by physical metals.
// Token prices come from the Denario price oracle, updated every minute, in 8 decimals.

const ADDRESSES = require('../helper/coreAssets.json')

const silverAddress = ADDRESSES.polygon.DSC
const goldAddress = ADDRESSES.polygon.DGC
const priceOracle = '0x9be09fa9205e8f6b200d3c71a958ac146913662e'

const priceOracleABI = [
  {
    "inputs": [{ "name": "key", "type": "string" }],
    "name": "getValue",
    "outputs": [
      { "name": "", "type": "uint128" },
      { "name": "", "type": "uint128" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]

const firstBlock = 62270459

async function tvl(api) {
	const totalSilverSupply = await api.call({
		abi: 'erc20:totalSupply',
		target: silverAddress,
	})
	const totalGoldSupply = await api.call({
		abi: 'erc20:totalSupply',
		target: goldAddress,
	})

	const silverPrice = await api.call({
		target: priceOracle,
		params: 'silvercoin/latest/USD',
		abi: priceOracleABI[0]
	}).then(res => res[0])
	const goldPrice = await api.call({
		target: priceOracle,
		params: 'goldcoin/latest/USD',
		abi: priceOracleABI[0]
	}).then(res => res[0])

	// Oracle prices are in 8 decimals; tokens have 18 decimals; USDC has 6 decimals
	const silverValueInUSD = (totalSilverSupply * (silverPrice / 1e8)) / 1e18
	const goldValueInUSD = (totalGoldSupply * (goldPrice / 1e8)) / 1e18
	const totalValueInUSD = silverValueInUSD + goldValueInUSD
	api.add(ADDRESSES.polygon.USDC, totalValueInUSD * 1e6)

	return {
		[silverAddress]: totalSilverSupply,
		[goldAddress]: totalGoldSupply,
	}
}

module.exports = {
	methodology: 'TVL is the total amount of DSC (Denario Silver Coin) and DGC (Denario Gold Coin) tokens minted on Polygon, each 100% backed by physical metal and priced via the Denario on-chain oracle.',
	start: firstBlock,
	polygon: {
		tvl,
	}
}
