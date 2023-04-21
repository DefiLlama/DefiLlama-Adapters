const sdk = require("@defillama/sdk");
const { config } = require('./config')
const { sumTokens2, } = require('../helper/unwrapLPs')

async function calculateTvl(contract, chain, block) {
	
	console.log("Contract:", contract); // Add this line to see the value of contract
	console.log("Chain:", chain); // Add this line to see the value of chain
	console.log("Block:", block); // Add this line to see the value of block
	
    let tokensAndOwners = await mapTokensToContract(contract, chain, block)
	
	console.log("TokensAndContract:", tokensAndOwners); // Add this line to see the value of tokensAndContract
	
	return sumTokens2({ tokensAndOwners, chain, block,  })
}

async function mapTokensToContract(contract, chain, block) {
	const { output: safeTokenHoldings } = await sdk.api.abi.multiCall({
    calls: [{ target: contract }],
    abi: abi.token,
    chain, block,
  })
  
  return safeTokenHoldings.map(({ output}, i) => ([output, contract]))
}

const chains = [
  'arbitrum',
  'bsc',
  'polygon',
  'core',
  'dogechain',
  "metis"
]

module.exports = {}

chains.forEach(chain => {
  let contract = config.kimberliteSafeBSC.locker

  switch (chain) {
    case 'arbitrum': contract = config.kimberliteSafeARB.locker; break;
    case 'metis': contract = config.kimberliteSafeMETIS.locker; break;
    case 'polygon': contract = config.kimberliteSafeMATIC.locker ; break;
	case 'core': contract = config.kimberliteSafeCORE.locker ; break;
	case 'dogechain': contract = config.kimberliteSafeDOGE.locker ; break;
  }

  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block }) => calculateTvl(contract, chain, block),
  }
})
