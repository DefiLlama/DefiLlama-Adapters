// projects/zerobase/index.js
// const { sumSingleBalance } = require('@defillama/sdk/dist/helper');

// ABI fragment for vault.getTVL(address) → uint256
const tvlAbi = {
  inputs: [{ internalType: 'address', name: '_token', type: 'address' }],
  name: 'getTVL',
  outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
  stateMutability: 'view',
  type: 'function',
};

/**
 * A generic TVL helper that:
 * - takes a vault address and array of tokens
 * - multicalls vault.getTVL(token) for each token
 * - adds each result into balances
 */
async function chainTvl(api, vaultAddress, tokens) {
  // build calls array
  const calls = tokens.map(t => ({
    target: vaultAddress,
    abi: tvlAbi,
    params: [t],
  }));
  // execute multicall
  const results = await api.multiCall({ calls, abi: tvlAbi });

  // aggregate into the balances object
  results.forEach((amt, i) => {
    api.add(tokens[i], amt);
    // or, if you prefer:
    // sumSingleBalance(api.getBalances(), tokens[i], amt);
  });

  return api.getBalances();
}

// Chain‑specific TVL functions
async function ethereumTvl(api) {
  const vault   = '0x9eF52D8953d184840F2c69096B7b3A7dA7093685';
  const tokens  = [
    '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
  ];
  return chainTvl(api, vault, tokens);
}

async function bscTvl(api) {
  const vault   = '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4';      // replace with your BSC vault
  const tokens  = [
    '0x55d398326f99059fF775485246999027B3197955', // USDT on BSC
    '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', // USDC on BSC
  ];
  return chainTvl(api, vault, tokens);
}

async function polygonTvl(api) {
  const vault   = '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4';      // replace with your Polygon vault
  const tokens  = [
    '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDC on Polygon
    '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', // WBTC on Polygon
  ];
  return chainTvl(api, vault, tokens);
}

async function arbitrumTvl(api) {
  const vault   = '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4';      // replace with your Arbitrum vault
  const tokens  = [
    '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT on Arbitrum
    '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // USDC on Arbitrum
  ];
  return chainTvl(api, vault, tokens);
}

async function optimismTvl(api) {
  const vault   = '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4';      // replace with your Optimism vault            
  const tokens  = [
    '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT on Optimism
    '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85', // USDC on Optimism
  ];
  return chainTvl(api, vault, tokens);
}

async function avalancheTvl(api) {
  const vault   = '0xC3e9006559cB209a987e99257986aA5Ce324F829'; // replace with your Avalanche vault        
  const tokens  = [
    '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', // USDT on Avalanche
    '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E', // USDC on Avalanche
  ];        
    return chainTvl(api, vault, tokens);
}

async function baseTvl(api) {
  const vault   = '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4';      // replace with your Base vault
    const tokens  = [
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC on Base
    ]; 
    return chainTvl(api, vault, tokens);
}


module.exports = {
    methodology: 'For each chain: call getTVL(token) on its vault and sum per‐token amounts',
    start: 1200000,      // earliest block for all chains (or set per‑chain if you like)
    ethereum: { tvl: ethereumTvl },
    bsc:      { tvl: bscTvl },
    polygon:  { tvl: polygonTvl },
    arbitrum: { tvl: arbitrumTvl },
    optimism: { tvl: optimismTvl },
    avax: { tvl: avalancheTvl },
    base: { tvl: baseTvl },
};
