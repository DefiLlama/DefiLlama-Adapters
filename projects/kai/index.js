const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const wUsdcVault = {
  id: '0x7a2f75a3e50fd5f72dfc2f8c9910da5eaa3a1486e4eb1e54a825c09d82214526',
  tType: ADDRESSES.sui.USDC
}
const wUsdtVault = {
  id: '0x0fce8baed43faadf6831cd27e5b3a32a11d2a05b3cd1ed36c7c09c5f7bcb4ef4',
  tType: ADDRESSES.sui.USDT
}
const SuiVault = {
  id: '0x16272b75d880ab944c308d47e91d46b2027f55136ee61b3db99098a926b3973c',
  tType: ADDRESSES.sui.SUI
}
const UsdcVault = {
  id: '0x5663035df5f403ad5a015cc2a3264de30370650bc043c4dab4d0012ea5cb7671',
  tType: ADDRESSES.sui.USDC_CIRCLE
}

async function tvl(api) {
  const vaults = [wUsdcVault, wUsdtVault, SuiVault, UsdcVault]
  const vaultObjs = await sui.getObjects(vaults.map(v => v.id))

  for (let i = 0; i < vaults.length; i++) {
    const vault = vaults[i]
    const vaultObj = vaultObjs[i]

    let tvl = BigInt(vaultObj.fields.free_balance)
    for (const strategy of vaultObj.fields.strategies.fields.contents) {
      tvl += BigInt(strategy.fields.value.fields.borrowed)
    }

    api.add(vault.tType, Number(tvl))
  }
}

module.exports = {
  timetravel: false,
  sui: {
    tvl,
  },
};

