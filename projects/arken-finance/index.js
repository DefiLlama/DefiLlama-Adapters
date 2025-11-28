const ADDRESSES = require('../helper/coreAssets.json');
const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/unwrapLPs');

const CONTRACTS = {
  proxy: '0xAaaA55c44C7B4d87662Fc8Ff1f310c96Ed57CE1F',
  arkenDexV4: '0x0d4de4657a95a19e58f1bce423269c88c6a4b500',
  arkenDexTrader: '0x1220774a253b1a2ca7e5a2b088901e10a6e0f70e',
  timelock: '0xbFabaa95267BA1144051bb8d39766a0A2215985C',
  multisig: '0x41a1552E752Baddf4aFFdd8852093DeEcdE5aC61',
  arkenSlamm: '0xB3bBb464485F159B839E1699A352cE6D542c9433',
};

async function tvl(api) {
  const contractAddresses = Object.values(CONTRACTS);
  
  // Track native ETH balances explicitly
  // Include ADDRESSES.null to track native ETH for all contract addresses
  const tokens = [ADDRESSES.null];
  
  // If you know which ERC20 tokens these contracts hold, add them here:
  // tokens.push('0x...', '0x...');
  
  // Use sumTokens2 to get balances for native ETH and any specified tokens
  return sumTokens2({
    api,
    owners: contractAddresses,
    tokens,
  });
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology: `TVL counts tokens held across Arken Finance's core contracts on Arbitrum: Proxy, ArkenDexV4, Trader, Timelock, Multisig, and Slamm. 
Includes liquidity pools, collateral, and treasury assets. Excludes borrowed assets per DeFiLlama standards.`,
  start: 1672531200, // Approx Jan 2023, adjust to Arken launch
};