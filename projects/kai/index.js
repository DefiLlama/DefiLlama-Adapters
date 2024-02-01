const ADDRESSES = require('../helper/coreAssets.json')
const sui = require("../helper/chain/sui");

const UsdcVault = {
  id: '0x7a2f75a3e50fd5f72dfc2f8c9910da5eaa3a1486e4eb1e54a825c09d82214526',
  tType: '0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN'
}
const UsdtVault = {
  id: '0x0fce8baed43faadf6831cd27e5b3a32a11d2a05b3cd1ed36c7c09c5f7bcb4ef4',
  tType: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN'
}
const SuiVault = {
  id: '0x16272b75d880ab944c308d47e91d46b2027f55136ee61b3db99098a926b3973c',
  tType: '0x2::sui::SUI'
}

async function tvl(_, _1, _2, { api }) {
  const vaults = [UsdcVault, UsdtVault, SuiVault]
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

