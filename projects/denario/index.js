// Denario Silver Coin is 100% backed by physical silver.
// Price is determined by the price of silver on the spot market plus premium.
// The price is stored in the price oracle and updated every minute.

const sdk = require('@defillama/sdk');
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

	const [silverPriceRaw, goldPriceRaw] = await Promise.all([
    api.call({
		target: priceOracle,
		params: 'silvercoin/latest/USD',
		abi: priceOracleABI[0]
	}).then(res => res[0]),

	 api.call({
      target: priceOracle,
      params: 'goldcoin/latest/USD',
      abi: priceOracleABI[0]
    }).then(res => res[0])
  ])
  
// Oracle price has 8 decimals; tokens have 18 decimals; USDC has 6 decimals.
// Scale factor: price(8d) * supply(18d) / 1e18 * 1e6 / 1e8 = supply * price / 1e20
const SCALE = BigInt('100000000000000000000') // 1e20
const silverValueUSDC = BigInt(totalSilverSupply) * BigInt(silverPriceRaw) / SCALE
const goldValueUSDC = BigInt(totalGoldSupply) * BigInt(goldPriceRaw) / SCALE
const totalValueUSDC = silverValueUSDC + goldValueUSDC

api.add(ADDRESSES.polygon.USDC, totalValueUSDC.toString()) // USDC has 6 decimals
	return {
		[silverAddress]: totalSilverSupply,
		[goldAddress]: totalGoldSupply,
	}
}

module.exports = {
	misrepresentedTokens: true,
	methodology: 'TVL corresponds to the total amount of token minted, which is 100% backed by physical metal.',
	start: firstBlock,
	polygon: {
		tvl,
	}
}
