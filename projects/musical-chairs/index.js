const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk');

// Actual deployed contract address on Arbitrum One
const CONTRACT_ADDRESS = "0xEDA164585a5FF8c53c48907bD102A1B593bd17eF"; 

async function tvl(api) {
  // The TVL is the total ETH balance held by the game contract.
  // This includes active player stakes and any accumulated, non-withdrawn commissions.

  // Use sdk.api.eth.getBalance to fetch the native token balance of the contract.
  const balance = await sdk.api.eth.getBalance({
    target: CONTRACT_ADDRESS,
    chain: api.chain,
    block: api.block,
  });

  // The result from getBalance is an object, we need its 'output' property.
  // The SDK's `add` function uses the zero address to represent the native token (ETH on Arbitrum).
  api.add(ADDRESSES.null, balance.output);
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: "TVL is calculated as the total ETH balance held in the MusicalChairsGame smart contract. This includes player stakes for active and pending games, as well as any accumulated but not yet withdrawn platform commissions.",
  // Block number when your contract was deployed
  start: 356832883,
};
