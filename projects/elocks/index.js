const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getTokenPrices, sumUnknownTokens } = require('../helper/unknownTokens')
const { unwrapUniswapLPs } = require('../helper/unwrapLPs')

const IELOCKS = {
	totalSupply: "uint256:totalSupply",
	tvl: "uint256:tvl",
	lockers: "function lockers(uint) external view returns(address)",
	lockedAssets: "function lockedAssets(uint) public view returns (address, uint, uint)"
}

const elocks = {
  "fantom": "0x2f20A659601d1c161A108E0725FEF31256a907ad"
}

module.exports = {
  misrepresentedTokens: true,
  methodology: "USD-denominated value",
}


async function findTvl(chain, nft, block, api) {
	let { output: len } = await sdk.api.abi.call({
		target: nft,
		abi: IELOCKS.totalSupply,
		chain,
	})
	len = Number(len);

	let calls = []
	for (let i = 1; i <= len; i++) { calls.push({ params: [i] }) }
	let { output: las } = await sdk.api.abi.multiCall({
		target: nft,
		abi: IELOCKS.lockedAssets,
		calls,
		chain,
	})
	lpBalances = las.map(i=> ({token: i.output[0], balance: Number(i.output[1])/1e0}) )
	tokens = lpBalances.map(i=>i.token)
	bals = lpBalances.map(i=>i.balance)
	api.addTokens(tokens, bals)
	return await unwrapUniswapLPs(bals, lpBalances, block, chain)
}


Object.entries(elocks).forEach(([chain, target, block]) => {
  module.exports[chain] = {
    tvl: async (api) => findTvl(chain, target, block, api),
  }
})
