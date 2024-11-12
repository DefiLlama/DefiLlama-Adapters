const sdk = require('@defillama/sdk');

async function TS(chain,asset) {
	let { output: rd } = await sdk.api.abi.call({
		target: asset,
		abi: "uint256:totalSupply",
		chain,
	})
	return Number(rd)
}

const countedChains = {
  "fantom": true,
}


async function findTvl(chain, block, api) {
	// addToken( UnderlyingToken , Wrap.totalSupply )

	if(chain=="fantom") {
		//api.addToken( "" , await TS(chain,"") )
		// NOTE : addToken does not "sum" amounts if used multiple times!!! Sum up multiple TS before doing addToken()
		api.addToken( "0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83" , await TS(chain,"0x85fb1081a0354f8e80a2743f74399bfaf5df328a") ) // eliteFmoneyWFTM
		api.addToken( "0xd7028092c830b5c8fce061af2e593413ebbc1fc1" , await TS(chain,"0xe391719869890ad91ee6076565111fbe942c3073") )	// eliteFmoneySFTMX
		api.addToken( "0x2F733095B80A04b38b0D10cC884524a3d09b836a" , await TS(chain,"0xed49b19afd8d2eefd183691aedba3b9ef8eb5f4e") )	// eliteFmoneyWormholeUSDC.e
		api.addToken( "0x1b6382dbdea11d97f24495c9a90b7c88469134a4" , await TS(chain,"0x37109a61CDa9bfE6d49F19E4911080b250cc52e0") )	// eliteFmoneyAxelarUSDC
	}
	if(chain=="base") {
		;
	}
}


module.exports = {
  methodology: "Principal Tokens (PT) are always 1:1 mintable & redeemable with Underlying Tokens (UT). TVL is Total Market Cap of all PT, where 1 PT = 1 UT.",
}

Object.entries(countedChains).forEach(([chain, block]) => {
  module.exports[chain] = {
    tvl: async (api) => findTvl(chain, block, api),
  }
})
