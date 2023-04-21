const sdk = require("@defillama/sdk");
const { config } = require('./config')
const abi = require("./abi.json");
const { vestingHelper } = require("../helper/unknownTokens");

async function calculateTvl(contract, chain, block) {
	
	const { output: lengths } = await sdk.api.abi.call({
		target: contract,
		abi: abi.depositId,
		chain,
		block,
	});
  
	console.log("Chain:", chain); // Add this line to see the value of chain
	console.log("Contract:", contract); // Add this line to see the value of contract
	console.log("Lengths:", lengths); // Add this line to see the content of lengths object
	console.log("Block:", block); // Add this line to see the value of block
	
	const allBalances = await getBalances(contract, chain, block, lengths);

	console.log("Balances:", allBalances); // Add this line to see the value of block
	
	return allBalances;
}

async function getBalances(contract, chain, block, length) {
    const calls = [];
    for (let i = 1; i <= length; i++)
    calls.push({ target: contract, params: i })
  
	console.log("Calls:", calls); // Add this line to see the content of calls array
	
    const { output } = await sdk.api.abi.multiCall({
      abi: abi.lockedToken, requery: true,
      calls, chain, block,
    });
	
    const token = output.map(i => i.output.tokenAddress);
	
	const blacklist = [];
	
    return await vestingHelper({
      useDefaultCoreAssets: true,
      blacklist,
      owner: contract,
      token,
      block, chain,
      log_coreAssetPrices: [
        300/ 1e18,
        1/ 1e18,
        1/ 1e18,
        1/ 1e18,
      ],
      log_minTokenValue: 1e6,
    })
 };

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
    misrepresentedTokens: true,
    tvl: async (_, _b, { [chain]: block }) => calculateTvl(contract, chain, block),
  }
})
