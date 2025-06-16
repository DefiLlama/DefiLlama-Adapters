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
  id: '0x4974f5d24f3e23fdeea98ff259446bd086e1e3a0d4aefc0c2f5d0e74919991f1',
  tType: ADDRESSES.sui.USDC_CIRCLE
}
const suiUsdtVault = {
  id: '0xb606452ef941a91dae4d6bf21c4e2ba82b309377570aea151d8ec62ec234f7b6',
  tType: ADDRESSES.sui.suiUSDT
}
const usdyVault = {
  id: '0x02ec915b35fb958ca9a7d94e57d7254513ff711832ba8aebfc0ac3395152260b',
  tType: ADDRESSES.sui.USDY
}
const deepVault = {
  id: '0x6e58792dccbaa1d1d708d9a847a7c5b3f90c7878d1b76fd79afa48d31063bca6',
  tType: ADDRESSES.sui.DEEP
}

async function tvl(api) {
  const vaults = [wUsdcVault, wUsdtVault, SuiVault, UsdcVault, suiUsdtVault, usdyVault, deepVault]
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

