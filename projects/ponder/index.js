const sdk = require('@defillama/sdk');

// Addresses on Bitkub Chain (Chain ID: 96)
const addresses = {
  Factory: '0x20b17e92dd1866ec647acaa38fe1f7075e4b359e',
  PonderToken: '0xe0432224871917fb5a137f4a153a51ecf9f74f57',
  PonderStaking: '0x6c8119d33fd43f6b254d041cd5d2675586731dd5'
};

// ABIs
const factoryAbi = 'function allPairsLength() external view returns (uint256)';
const allPairsAbi = 'function allPairs(uint256) external view returns (address)';
const pairAbis = {
  token0: 'function token0() external view returns (address)',
  token1: 'function token1() external view returns (address)',
  getReserves: 'function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)'
};

async function tvl(api) {
  // Get total pairs
  const pairsLength = await api.call({
    abi: factoryAbi,
    target: addresses.Factory
  });
  
  if (Number(pairsLength) === 0) return {};
  
  // Get all pair addresses
  const pairCalls = [];
  for (let i = 0; i < Number(pairsLength); i++) {
    pairCalls.push({
      target: addresses.Factory,
      params: [i]
    });
  }
  
  const pairAddresses = await api.multiCall({
    abi: allPairsAbi,
    calls: pairCalls
  });
  
  // Get token addresses for each pair
  const [token0Addresses, token1Addresses] = await Promise.all([
    api.multiCall({
      abi: pairAbis.token0,
      calls: pairAddresses.map(p => ({ target: p }))
    }),
    api.multiCall({
      abi: pairAbis.token1,
      calls: pairAddresses.map(p => ({ target: p }))
    })
  ]);
  
  // Get reserves for all pairs
  const reserves = await api.multiCall({
    abi: pairAbis.getReserves,
    calls: pairAddresses.map(p => ({ target: p }))
  });
  
  // Add token balances
  for (let i = 0; i < pairAddresses.length; i++) {
    const token0 = token0Addresses[i];
    const token1 = token1Addresses[i];
    const [reserve0, reserve1] = reserves[i];
    
    api.add(token0, reserve0);
    api.add(token1, reserve1);
  }
}

async function staking(api) {
  const balance = await api.call({
    abi: 'erc20:balanceOf',
    target: addresses.PonderToken,
    params: [addresses.PonderStaking]
  });
  
  api.add(addresses.PonderToken, balance);
}

module.exports = {
  methodology: 'TVL includes the liquidity in all Ponder trading pairs on Bitkub Chain.',
  bitkub: {
    tvl,
    staking
  }
};