const sdk = require("@defillama/sdk");
const abi = require("./abi.json");
const { vestingHelper } = require("../helper/unknownTokens");
const { config } = require('./config')

async function calculateTvl(contract, chain, block) {
  const { output: lengths } = await sdk.api.abi.call({
    target: contract,
    abi: abi.depositId,
    chain,
    block,
  });
  
  console.log("Lengths:", lengths); // Add this line to see the content of lengths object

  const contractBalance = await getBalances(contract, lengths, chain, block);
  console.log("contractBalance:", contractBalance);

  Object.entries(contractBalance).forEach(([token, val]) => {
    sdk.util.sumSingleBalance(balances, token, val);
  });
}

async function getBalances(vault, length, chain, block) {
	
  console.log("Length:", length); // Add this line to see the value of length

  const calls = [];
  for (let i = 1; i <= length; i++) {
    calls.push({ target: vault, params: [i] }); // Pass the parameter as an array
  }
  
  const { output } = await sdk.api.abi.multiCall({
    abi: abi.lockedToken,
    requery: true,
    calls,
    chain,
    block,
  });
  
  console.log("Calls:", calls); // Add this line to see the content of calls array

  const tokens = output.map(i => i.output.tokenAddress);
  
  return vestingHelper({
    useDefaultCoreAssets: true,
    blacklist,
    owner: vault,
    tokens,
    block,
    chain,
  });
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
