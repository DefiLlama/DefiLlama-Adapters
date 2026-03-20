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
const pausedUsdcVault = {
  id: '0x5663035df5f403ad5a015cc2a3264de30370650bc043c4dab4d0012ea5cb7671',
  tType: ADDRESSES.sui.USDC_CIRCLE
}
const pausedSuiUsdtVault = {
  id: '0x7a2e56773ad4d9bd4133c67ed0ae60187f00169b584a55c0204175897e41d166',
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
const UsdcVault = {
  id: '0x3e8a6d1e29d2c86aed50d6055863b878a7dd382de22ea168177c80c1d7150061',
  tType: ADDRESSES.sui.USDC_CIRCLE
}
const suiUsdtVault = {
  id: '0xbfcab5f22e253be0768e2cc5e75e170c5266edf7b68c813af0d676e84285681c',
  tType: ADDRESSES.sui.suiUSDT
}
const walVault = {
  id: '0x4ee20ca2594e137a1388d5de03c0b1f3dd7caddefb4c55b1c7bca15d0fe18c86',
  tType: ADDRESSES.sui.WAL
}
const wbtcVault = {
  id: '0x5674aae155d38e09edaf3163f2e3f85fe77790f484485f0b480ca55915d7c446',
  tType: ADDRESSES.sui.BTC
}
const lbtcVault = {
  id: '0x362ce1fc1425ec0bdf958f2023b07cda52c924fa42e4ff88a9a48c595fd8437d',
  tType: '0x3e8e9423d80e1774a7ca128fccd8bf5f1f7753be658c5e645929037f7c819040::lbtc::LBTC'
}
const xbtcVault = {
  id: '0x653beede5a005272526f0c835c272ef37491dc5bff3f8e466175e02675510137',
  tType: '0x876a4b7bce8aeaef60464c11f4026903e9afacab79b9b142686158aa86560b50::xbtc::XBTC'
}

async function tvl(api) {
  const vaults = [
    wUsdcVault, wUsdtVault, SuiVault, pausedUsdcVault, pausedSuiUsdtVault,
    usdyVault, deepVault, UsdcVault, suiUsdtVault, walVault, wbtcVault, lbtcVault,
    xbtcVault
  ]
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

