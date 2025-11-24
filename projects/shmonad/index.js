// Shmonad Protocol - DeFiLlama TVL Adapter
// TVL is calculated as: staked + reserved + allocated - distributed + currentAssets

const SHMONAD_CONTRACT = '0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c';
const MON_TOKEN_ADDRESS = '0x0000000000000000000000000000000000000000';

// ABI for the contract functions
const SHMONAD_ABI = {
  getAtomicCapital: 'function getAtomicCapital() view returns (uint256 allocated, uint256 distributed)',
  getCurrentAssets: 'function getCurrentAssets() view returns (uint256)',
  getWorkingCapital: 'function getWorkingCapital() view returns (uint256 staked, uint256 reserved)',
};

async function tvl(api) {
  // Call all three functions in parallel
  const [atomicCapital, currentAssets, workingCapital] = await Promise.all([
    api.call({
      target: SHMONAD_CONTRACT,
      abi: SHMONAD_ABI.getAtomicCapital,
    }),
    api.call({
      target: SHMONAD_CONTRACT,
      abi: SHMONAD_ABI.getCurrentAssets,
    }),
    api.call({
      target: SHMONAD_CONTRACT,
      abi: SHMONAD_ABI.getWorkingCapital,
    }),
  ]);

  // Extract values from the results
  // getAtomicCapital returns a tuple: {allocated, distributed} or [allocated, distributed]
  const allocated = atomicCapital?.allocated ?? atomicCapital?.[0] ?? 0n;
  const distributed = atomicCapital?.distributed ?? atomicCapital?.[1] ?? 0n;
  
  // getCurrentAssets returns a single value
  const currentAssetsValue = currentAssets || 0n;
  
  // getWorkingCapital returns a tuple: {staked, reserved} or [staked, reserved]
  const staked = workingCapital?.staked ?? workingCapital?.[0] ?? 0n;
  const reserved = workingCapital?.reserved ?? workingCapital?.[1] ?? 0n;

  // Calculate TVL: staked + reserved + allocated - distributed + currentAssets
  const tvlBigInt = BigInt(staked) + BigInt(reserved) + BigInt(allocated) - BigInt(distributed) + BigInt(currentAssetsValue);

  // Add the MON token balance to TVL
  // Using zero address (0x0000...) for native MON token on Monad chain
  if (tvlBigInt > 0n) {
    api.add(MON_TOKEN_ADDRESS, tvlBigInt);
  }

  return api.getBalances();
}

module.exports = {
  methodology: 'TVL is calculated as the sum of staked, reserved, allocated capital (minus distributed), and current assets held by the Shmonad protocol.',
  timetravel: true,
  monad: {
    tvl,
  },
};

