const ADDRESSES = require('../helper/coreAssets.json')

// JackCo: No-loss lottery on Base — deposits earn yield across Aave, Morpho, Pendle;
// weekly prize pool funded entirely by yield (principal always 100% safe).
//
// TVL = USDC managed by JackCoVault, including assets deployed to yield adapters.
// totalAssets() is the ERC-4626 standard view function tracking _totalManagedAssets,
// which is incremented on deposit, decremented on withdrawal, and synced to
// strategyManager.totalValue() + vaultBalance via syncTotalAssets() (keeper-called weekly).

const VAULT   = '0xB751a4831A893a2feaC6D9642E6680f13D8dbDD2'
const USDC    = ADDRESSES.base.USDC  // 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913

async function tvl(api) {
  const total = await api.call({
    target: VAULT,
    abi:    'uint256:totalAssets',
  })
  api.add(USDC, total)
}

module.exports = {
  methodology: 'Counts USDC deposited in the JackCo no-loss lottery vault on Base (ERC-4626). TVL includes funds deployed across Aave, Morpho, and Pendle yield adapters, as tracked by the vault\'s totalAssets() which is synced with the StrategyManager weekly.',
  base: { tvl },
}
