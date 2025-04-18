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

// Chunk size for processing large number of pairs
const CHUNK_SIZE = 100;

async function tvl(api) {
  try {
    // Get total number of pairs
    const allPairsLength = await api.call({
      abi: factoryAbi,
      target: addresses.Factory,
    });
    
    if (Number(allPairsLength) === 0) {
      return {}; // No pairs found
    }
    
    const totalPairs = Number(allPairsLength);
    
    // Process pairs in chunks to avoid timeouts and memory issues
    for (let chunkStart = 0; chunkStart < totalPairs; chunkStart += CHUNK_SIZE) {
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalPairs);
      
      // Get pair addresses for this chunk
      const pairCalls = Array.from(
        { length: chunkEnd - chunkStart }, 
        (_, i) => ({
          target: addresses.Factory,
          params: [chunkStart + i]
        })
      );
      
      const pairAddresses = await api.multiCall({
        abi: allPairsAbi,
        calls: pairCalls
      });
      
      // Get token addresses and reserves for this chunk
      const [token0Addresses, token1Addresses, reserves] = await Promise.all([
        api.multiCall({
          abi: pairAbis.token0,
          calls: pairAddresses.map(p => ({ target: p }))
        }),
        api.multiCall({
          abi: pairAbis.token1,
          calls: pairAddresses.map(p => ({ target: p }))
        }),
        api.multiCall({
          abi: pairAbis.getReserves,
          calls: pairAddresses.map(p => ({ target: p }))
        })
      ]);
      
      // Add balances for this chunk
      for (let i = 0; i < pairAddresses.length; i++) {
        const token0 = token0Addresses[i];
        const token1 = token1Addresses[i];
        const [reserve0, reserve1] = reserves[i];
        
        api.add(token0, reserve0);
        api.add(token1, reserve1);
      }
    }
  } catch (error) {
    console.error(`Error in Ponder TVL calculation: ${error}`);
    return {};
  }
}

async function staking(api) {
  try {
    // Get PONDER balance in staking contract
    const stakedPonderBalance = await api.call({
      abi: 'erc20:balanceOf',
      target: addresses.PonderToken,
      params: [addresses.PonderStaking]
    });
    
    api.add(addresses.PonderToken, stakedPonderBalance);
  } catch (error) {
    console.error(`Error in Ponder staking TVL calculation: ${error}`);
    return {};
  }
}

async function pool2(api) {
  try {
    const ponderTokenAddress = addresses.PonderToken.toLowerCase();
    const pairsLength = await api.call({
      abi: factoryAbi,
      target: addresses.Factory
    });
    
    if (Number(pairsLength) === 0) return {};
    
    const totalPairs = Number(pairsLength);
    
    // Process pairs in chunks
    for (let chunkStart = 0; chunkStart < totalPairs; chunkStart += CHUNK_SIZE) {
      const chunkEnd = Math.min(chunkStart + CHUNK_SIZE, totalPairs);
      
      // Get pair addresses for this chunk
      const pairCalls = Array.from(
        { length: chunkEnd - chunkStart }, 
        (_, i) => ({
          target: addresses.Factory,
          params: [chunkStart + i]
        })
      );
      
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
      
      // Find pairs that contain PONDER token
      const ponderPairs = [];
      
      for (let i = 0; i < pairAddresses.length; i++) {
        const token0 = token0Addresses[i].toLowerCase();
        const token1 = token1Addresses[i].toLowerCase();
        
        if (token0 === ponderTokenAddress || token1 === ponderTokenAddress) {
          ponderPairs.push({
            pairAddress: pairAddresses[i],
            token0: token0Addresses[i],
            token1: token1Addresses[i]
          });
        }
      }
      
      // Get reserves for PONDER pairs
      if (ponderPairs.length > 0) {
        const reserves = await api.multiCall({
          abi: pairAbis.getReserves,
          calls: ponderPairs.map(p => ({ target: p.pairAddress }))
        });
        
        // Add balances for PONDER pairs
        for (let i = 0; i < ponderPairs.length; i++) {
          const token0 = ponderPairs[i].token0;
          const token1 = ponderPairs[i].token1;
          const [reserve0, reserve1] = reserves[i];
          
          api.add(token0, reserve0);
          api.add(token1, reserve1);
        }
      }
    }
  } catch (error) {
    console.error(`Error in Ponder pool2 TVL calculation: ${error}`);
    return {};
  }
}

module.exports = {
  methodology: 'TVL includes the liquidity in all Ponder trading pairs on Bitkub Chain. Staking counts PONDER tokens locked in the staking contract. Pool2 counts liquidity in trading pairs that involve the PONDER token.',
  start: 1704067200, // January 1, 2024 (approximate launch date)
  bitkub: {
    tvl,
    staking,
    pool2
  }
};