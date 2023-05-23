const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const { getConfig } = require('../helper/cache')

const BigNumber = require('bignumber.js')

const oldPools = {
	ethereum: ["0xe82906b6B1B04f631D126c974Af57a3A7B6a99d9",],
}

const chainConfig = {
	ethereum: { chainId: 1, },
	polygon: { chainId: 137, },
	moonbeam: { chainId: 1284, },
	optimism: { chainId: 10, },
	arbitrum: { chainId: 42161, },
}
const weth = ADDRESSES.ethereum.WETH
const moonbeamGLMR = "moonbeam:0x0000000000000000000000000000000000000802"

async function getChainData(chain) {
	const { chainId } = chainConfig[chain]

	const {
			pool: {
				address: poolAddress
			},
			assets
	} = await getConfig('clipper/'+chain,`https://api.clipper.exchange/rfq/pool?chain_id=${chainId}`)
	return {
		poolAddress,
		assets: assets.map(({ address }) => address)
	}
}

function chainTVL(chain) {
	return {
		tvl: async (time, _block, chainBlocks) => {
			const balances = {}
			const block = chainBlocks[chain]
			const transform = await getChainTransform(chain)
			const { poolAddress, assets } = await getChainData(chain)
			const pools = oldPools[chain] || []
			const poolAddresses = [poolAddress, ...pools,]

			await sumTokensAndLPsSharedOwners(balances, assets.map(t => [t, false]), poolAddresses, block, chain, transform)

			if (balances[moonbeamGLMR]) {
				balances['moonbeam'] = BigNumber(balances[moonbeamGLMR]).dividedBy(10 ** 18).toFixed(0)
				delete balances[moonbeamGLMR]
			}

			if (chain === 'ethereum')
				for(const pool of poolAddresses)
					sdk.util.sumSingleBalance(balances, weth, (await sdk.api.eth.getBalance({ target: pool, block })).output)

			return balances

		}
	}
}

const chainTVLObject = Object.keys(chainConfig).reduce((agg, chain) => ({ ...agg, [chain]: chainTVL(chain) }), {})

module.exports = {
	...chainTVLObject,
	methodology: `Counts the tokens in pool address in different chains`
}
