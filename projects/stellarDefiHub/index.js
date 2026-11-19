const { getContractInstanceStorage, callSoroban } = require("../helper/chain/stellar");

// pre-deposit vaults: principal is tracked in instance storage
const vaults = [
  'CA54LVHMAY7HGLMVPN4W72XJB4OGKVZBZX26FWN6JD4P3HJFWQUQEHJO', // XLM vault
  'CAHEWHOPPDBQYFMAOLDOXXGUX2BCR7EXP4CWYCRY3NEAJB35YPZMMJFF', // USDC vault
  'CAQRAXBU6G4AAX4BZ7R4WLB62TSVAQFS5ZXJDVXRLAU2NZ2ZTGU5QOYB', // PYUSD vault
]

// share vaults: total_assets includes funds deployed to subaccounts
const shareVaults = [
  'CALFCZ4TY2CLHDHNJWCZX6JKYGUPV7P3GNQ3UVABXNE5JCV2E774APUM', // Evergreen vault
]

async function tvl(api) {
  for (const vault of vaults) {
    const { DepositAsset, TotalPrincipal } = await getContractInstanceStorage(vault)
    if (DepositAsset && TotalPrincipal) api.add(DepositAsset, TotalPrincipal.toString())
  }
  for (const vault of shareVaults) {
    const { AssetAddress } = await getContractInstanceStorage(vault)
    const totalAssets = await callSoroban(vault, 'total_assets')
    api.add(AssetAddress, totalAssets.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Count all assets deposited in the Stellar DeFi Hub vaults.',
  stellar: { tvl },
}
