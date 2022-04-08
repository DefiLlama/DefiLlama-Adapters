const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')
const { getChainTransform } = require('../helper/portedTokens')
const sdk = require('@defillama/sdk')
const retry = require('../helper/retry')
const axios = require("axios")
const BigNumber = require('bignumber.js')

const pool = {
	eth: "0xe82906b6B1B04f631D126c974Af57a3A7B6a99d9",
}

const chainConfig = {
	polygon: { chainId: 137, },
	moonbeam: { chainId: 1284, },
	optimism: { chainId: 10, },
}
const weth = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
const moonbeamGLMR = "moonbeam:0x0000000000000000000000000000000000000802"

async function eth(time, block) {
	const balances = {
		[weth]: (await sdk.api.eth.getBalance({ target: pool.eth, block })).output
	}
	await sumTokensAndLPsSharedOwners(balances, [
		"0x2260fac5e5542a773aa44fbcfedf7c193bc2c599", //wbtc
		"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", //usdc
		"0x6b175474e89094c44da98b954eedeac495271d0f", //dai
		"0xdac17f958d2ee523a2206206994597c13d831ec7", //usdt
	].map(t => [t, false]), [pool.eth], block)
	return balances
}

async function getChainData(chain) {
	const { chainId } = chainConfig[chain]

	const {
		data: {
			pool: {
				address: poolAddress
			},
			assets
		}
	} = await retry(async () => await axios.get(`https://api.clipper.exchange/rfq/pool?chain_id=${chainId}`))
	return {
		poolAddress,
		assets: assets.map(({ address }) => address)
	}
}

function chainTVL(chain) {
	return {
		tvl: async (time, block, chainBlocks) => {
			const balances = {}
			const transform = await getChainTransform(chain)
			const { poolAddress, assets } = await getChainData(chain)

			await sumTokensAndLPsSharedOwners(balances, assets.map(t => [t, false]), [poolAddress], chainBlocks[chain], chain, transform)

			if (balances[moonbeamGLMR]) {
				balances['moonbeam'] = BigNumber(balances[moonbeamGLMR]).dividedBy(10 ** 18).toFixed(0)
				delete balances[moonbeamGLMR]
			}
			return balances

		}
	}
}

const chainTVLObject = Object.keys(chainConfig).reduce((agg, chain) => ({ ...agg, [chain]: chainTVL(chain) }), {})

module.exports = {
	ethereum: {
		tvl: eth
	},
	...chainTVLObject,
	methodology: `Counts the tokens in pool address in different chains`
}