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
	//console.log("nft.ts", len);


	/*
	/// Using TVL GURU (on-chain price calcs)

	let calls = []
	for (let i = 1; i <= len; i++) { calls.push({ params: [i] }) }
	let { output: lockaddrs } = await sdk.api.abi.multiCall({
		target: nft,
		abi: IELOCKS.lockers,
		calls,
		chain,
	})
	lockaddrs = lockaddrs.map(i=>i.output)
	//console.log("lockaddrs",lockaddrs)

	const ltvls = (
		await sdk.api.abi.multiCall({
			abi: IELOCKS.tvl,
			calls: lockaddrs.map((la) => ({ target: la })),
			chain
		})
	).output.map((tvl) => Number(tvl.output)/1e18);
	//console.log("ltvls",ltvls)

	return { tether: ltvls.reduce((a,b)=>a+b) };
	*/


	/// Using DefiLlama pricing

	let calls = []
	for (let i = 1; i <= len; i++) { calls.push({ params: [i] }) }
	let { output: las } = await sdk.api.abi.multiCall({
		target: nft,
		abi: IELOCKS.lockedAssets,
		calls,
		chain,
	})
	/*
	/// Using { 0x123: 123, 0xtoken2: 456, ... }

	//las = las.map(i=> ({lpt: i.output[0], amt: Number(i.output[1])/1e0}) )
	las = las.map(i=> ({ [i.output[0].toLowerCase()] : Number(i.output[1])/1e0 }) )
	let lpamts = {};
	las.forEach(obj => {
    	for (let key in obj) {
        	if (lpamts[key]) {
            	lpamts[key] += obj[key];
        	} else {
            	lpamts[key] = obj[key];
        	}
    	}
	});
	//console.log("las",las,lpamts)
	console.log(await getTokenPrices(lpamts))
	return lpamts;
	*/
	lpBalances = las.map(i=> ({token: i.output[0], balance: Number(i.output[1])/1e0}) )
	//console.log("las",las,lpBalances)
	tokens = lpBalances.map(i=>i.token)
	bals = lpBalances.map(i=>i.balance)
	api.addTokens(tokens, bals)
    //return await sumUnknownTokens({ api, tokensAndOwners: [], useDefaultCoreAssets: true, lps: tokens, resolveLP: true, })
	//await unwrapUniswapLPs(lpBalances, chain)
	return await unwrapUniswapLPs(bals, lpBalances, block, chain)
}


Object.entries(elocks).forEach(([chain, target, block]) => {
  module.exports[chain] = {
    tvl: async (api) => findTvl(chain, target, block, api),
  }
})
