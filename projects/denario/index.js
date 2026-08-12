// Denario Silver Coin is 100% backed by physical silver.
// Price is determined by the price of silver on the spot market plus premium.
// The price is stored in the price oracle and updated every minute.

const ADDRESSES = require('../helper/coreAssets.json')

const silverAddress = ADDRESSES.polygon.DSC
const priceOracle = '0x9be09fa9205e8f6b200d3c71a958ac146913662e'

async function tvl(api) {

	const totalSilverSupply = await api.call({
		abi: 'erc20:totalSupply',
		target: silverAddress,
	})

	const [silverPrice] = await api.call({
		target: priceOracle,
		params: 'silvercoin/latest/USD',
		abi: 'function getValue(string key) view returns (uint128 value, uint128 timestamp)',
	})
	
	// Oracle price is in 8 decimals (standard for USD prices)
	const silverPriceInUSD = silverPrice / 1e8
	
	// Calculate total value in USD and add to balances
	const totalValueInUSD = (totalSilverSupply * silverPriceInUSD) / 1e18 // token has 18 decimals
	api.add(ADDRESSES.polygon.USDC, totalValueInUSD * 1e6) // USDC has 6 decimals
}

module.exports = {
	methodology: 'TVL corresponds to the total amount of token minted, which is 100% backed by physical metal.',
	misrepresentedTokens: true,
	polygon: {
		tvl,
	}
}
