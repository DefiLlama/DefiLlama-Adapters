const ADDRESSES = require('../helper/coreAssets.json')

// SuperEarn yield vaults on Kaia.
//
// Each "Super Vault" is a share-based yield vault that issues its own share
// token (EarnUSDT) and holds seCDV — the share token of the SuperEarn
// CooldownVault — as its underlying. seCDV is structurally pegged 1:1 to
// USDT because the CooldownVault is a passthrough / withdrawal-cooldown
// layer; yield accrues on EarnUSDT, not on seCDV. Verifiable on-chain:
//   CooldownVault.totalAssets() == CooldownVault.totalSupply()  →  PPS = 1.0
//   CooldownVault.convertToAssets(x) == x
//
// Super Vault.totalAssets() returns the amount of underlying (seCDV) under
// the vault's control. Combined with the 1:1 invariant above, that value can
// be priced directly as USDT.
//
// Add new vaults to the array as the protocol expands.
const config = {
  klaytn: {
    vaults: [
      '0x2e4e573D86c70688cD97D76bc5DDc1Bb265bF5D6', // Super Vault (EarnUSDT)
    ],
    asset: ADDRESSES.klaytn.USDT_1, // 0xd077...4fdb — canonical Kaia USDT
  },
}

function chainTvl(chain) {
  return async (api) => {
    const { vaults, asset } = config[chain]
    const totals = await api.multiCall({ abi: 'uint256:totalAssets', calls: vaults })
    totals.forEach((amount) => api.add(asset, amount))
  }
}

module.exports = {
  methodology:
    'TVL is the sum of totalAssets() across SuperEarn Super Vaults on Kaia. ' +
    'Each Super Vault holds seCDV (CooldownVault share) as its underlying. ' +
    'seCDV is structurally 1:1 with USDT because the CooldownVault is a ' +
    'passthrough cooldown layer (yield accrues on the Super Vault share token, ' +
    'EarnUSDT, not on seCDV — verifiable via CooldownVault.totalAssets() == ' +
    'CooldownVault.totalSupply()), so totalAssets() is priced directly as USDT.',
}

for (const chain of Object.keys(config)) {
  module.exports[chain] = { tvl: chainTvl(chain) }
}
