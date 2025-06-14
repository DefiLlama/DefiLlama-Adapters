// Denario Silver Coin is 100% backed by physical silver.
// Price is determined by the price of silver on the spot market plus premium.
// The price is stored in the price oracle and updated every minute.

const sdk = require('@defillama/sdk');
const ADDRESSES = require('../helper/coreAssets.json')

const silverAddress = ADDRESSES.polygon.DSC
const goldAddress = ADDRESSES.polygon.DGC
const priceOracle = '0x9be09fa9205e8f6b200d3c71a958ac146913662e'
// const goldPricequery = 'goldcoin/latest/usd'

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
	// const totalGoldSupply = await api.call({
	// 	abi: 'erc20:totalSupply',
	// 	target: goldAddress,
	// })

	const silverDecimals = await api.call({
		target: silverAddress,
		abi: 'erc20:decimals'
	})
	const silverPrice = await api.call({
		target: priceOracle,
		params: 'silvercoin/latest/USD',
		abi: 'function getValue(string key) view returns (uint128,uint128)'
	}).then(res => res[0])
	const silverPriceInUSD = silverPrice / 10 ** silverDecimals
	silverAddress.price = silverPriceInUSD

	return {
		[silverAddress]: totalSilverSupply,
		// [goldAddress]: totalGoldSupply,
	}
}

module.exports = {
	methodology: 'TVL corresponds to the total amount of token minted, which is 100% backed by physical metal.',
	start: firstBlock,
	polygon: {
		tvl,
	}
}
