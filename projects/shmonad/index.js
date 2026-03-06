// Shmonad Protocol - DeFiLlama TVL Adapter
// TVL is calculated as: staked + reserved + allocated - distributed + currentAssets

const SHMONAD_CONTRACT = '0x1B68626dCa36c7fE922fD2d55E4f631d962dE19c';

// ABI for the contract functions
const SHMONAD_ABI = {
  getAtomicCapital: 'function getAtomicCapital() view returns (uint256 allocated, uint256 distributed)',
  getCurrentAssets: 'function getCurrentAssets() view returns (uint256)',
  getWorkingCapital: 'function getWorkingCapital() view returns (uint256 staked, uint256 reserved)',
};

async function tvl(api) {
  const atomicCapital = await api.call({ target: SHMONAD_CONTRACT, abi: SHMONAD_ABI.getAtomicCapital, })
  const currentAssetsValue = await api.call({ target: SHMONAD_CONTRACT, abi: SHMONAD_ABI.getCurrentAssets, })
  const workingCapital = await api.call({ target: SHMONAD_CONTRACT, abi: SHMONAD_ABI.getWorkingCapital, })

  // Extract values from the results
  // getAtomicCapital returns a tuple: {allocated, distributed} or [allocated, distributed]
  const allocated = atomicCapital.allocated
  const distributed = atomicCapital.distributed

  // getWorkingCapital returns a tuple: {staked, reserved} or [staked, reserved]
  const staked = workingCapital.staked
  const reserved = workingCapital.reserved

  // Calculate TVL: staked + reserved + allocated - distributed + currentAssets
  const tvlBigInt = BigInt(staked) + BigInt(reserved) + BigInt(allocated) - BigInt(distributed) + BigInt(currentAssetsValue);

  // Add the MON token balance to TVL
  api.addGasToken(tvlBigInt);
}

module.exports = {
  methodology: 'TVL is calculated as the sum of staked, reserved, allocated capital (minus distributed), and current assets held by the Shmonad protocol.',
  monad: {
    tvl,
  },
};

