const ADDRESSES = require('../helper/coreAssets.json');

// SherpaVault (shUSD) - same address on all chains via CREATE2
const SHERPA_VAULT = '0x96043804D00DCeC238718EEDaD9ac10719778380';

async function tvl(api) {
  // Get totalStaked - USDC currently deployed earning yield
  const totalStaked = await api.call({
    target: SHERPA_VAULT,
    abi: 'uint256:totalStaked',
  });

  // Get totalPending - USDC deposits waiting for next round
  const totalPending = await api.call({
    target: SHERPA_VAULT,
    abi: 'uint256:totalPending',
  });

  // Add both as USDC balance
  api.add(ADDRESSES[api.chain].USDC, totalStaked);
  api.add(ADDRESSES[api.chain].USDC, totalPending);
}

module.exports = {
  methodology: 'TVL is calculated as the sum of totalStaked (USDC earning yield) and totalPending (USDC awaiting next round) in the SherpaVault contracts across all chains.',
  start: 1732276800, // November 22, 2024 - deployment date
  ethereum: { tvl },
  base: { tvl },
  monad: { tvl },
};
