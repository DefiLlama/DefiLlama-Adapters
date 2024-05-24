const { sumTokens } = require("../helper/chain/algorand")
const { chainExports } = require("../helper/exports")

const coreContractAddress = 'XGE65UPXAFATPMTKGPA2VNHLMDY2URHD7NNPI3XJ3ZOXEAU6E4ZGH7PWZY'

const chainMap = {
	'algorand': {
		'algorand:1': { name: 'algorand', decimals: 6 },
	},
	'avax': {
		'algorand:893309613': { name: 'avalanche-2', decimals: 8 },
	},
	'bitcoin': {
		'algorand:1058926737': { name: 'bitcoin', decimals: 8 },
	},
	'ethereum': {
		'algorand:887406851': { name: 'ethereum', decimals: 8 },
		'algorand:1007352535': { name: 'usd-coin', decimals: 6 },
	},
	'arbitrum': {
		'algorand:1221549217': { name: 'arbitrum', decimals: 8 },
	},
	'binance': {
		'algorand:891648844': { name: 'bnb', decimals: 8 },
	},
	'solana': {
		'algorand:887648583': { name: 'solana', decimals: 8 },
		'algorand:1684682524': { name: 'pyth-network', decimals: 6 },
		'algorand:1703994770': { name: 'wormhole', decimals: 6 },
	},
}

function chainTvl(chain) {
	return async () => {
		// Read contract token balances
		const contractData = await sumTokens({ owner: coreContractAddress })

		// Remap assets to their common names and normalize values
		const result = {}
		for (const asset in contractData) {
			// Skip if asset is not mapped
			const assetData = chainMap[chain]?.[asset]
			if (assetData !== undefined) {
				// Normalize value to the correct number of decimals for the asset
				const normalized = contractData[asset] / (10 ** assetData.decimals)
				result[assetData.name] = normalized.toString()
			}
		}

		return result
	}
}

module.exports = chainExports(chainTvl, Object.keys(chainMap))
module.exports.methodology = 'Calculates the TVL from the contract, then remaps assets for accurate value source'
