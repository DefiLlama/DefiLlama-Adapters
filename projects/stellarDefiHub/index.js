const { getContractInstanceStorage } = require("../helper/chain/stellar");

const vaults = [
  'CA54LVHMAY7HGLMVPN4W72XJB4OGKVZBZX26FWN6JD4P3HJFWQUQEHJO', // XLM vault
  'CAHEWHOPPDBQYFMAOLDOXXGUX2BCR7EXP4CWYCRY3NEAJB35YPZMMJFF', // USDC vault
  'CAQRAXBU6G4AAX4BZ7R4WLB62TSVAQFS5ZXJDVXRLAU2NZ2ZTGU5QOYB', // PYUSD vault
]

async function tvl(api) {
  for (const vault of vaults) {
    const { DepositAsset, TotalPrincipal } = await getContractInstanceStorage(vault)
    if (DepositAsset && TotalPrincipal) api.add(DepositAsset, TotalPrincipal.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Count all assets deposited in the Stellar DeFi Hub vaults.',
  stellar: { tvl },
}
