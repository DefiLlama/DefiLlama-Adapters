// Since the NAVs are hardcoded, here are the links to find the different NAVs from WisdomTree's PoR
// https://www.wisdomtree.com/investments/digital-funds/money-market/wtgxx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/flttx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/wtsyx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/wttsx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/tipsx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/wtstx
// https://www.wisdomtree.com/investments/digital-funds/fixed-income/wtlgx
// https://www.wisdomtree.com/investments/digital-funds/equity/spxux
// https://www.wisdomtree.com/investments/digital-funds/asset-allocation/wtsix

const { getAssetSupply } = require('../helper/chain/stellar.js')

const CONFIG = {
  stellar: [
   { asset: 'WTGX-GDMBNMFJ3TRFLASJ6UGETFME3PJPNKPU24C7KFDBEBPQFG2CI6UC3JG6', NAV: 1.000 }, // WTGX
   { asset: 'FLTT-GBTZKH3RNKW46XEZNCGZEBAGJISKDZKQXKSQ2N5G5SFX36TLWKKR6QJ6', NAV: 1.013 }, // FLTTX
   { asset: 'WTSY-GB3ZUC7FGDEEBXY3BDEJWMPNGBFA66YRI4QQT6PBO3ZT6F33S7RL36VF', NAV: 1.004 }, // WTSYX
   { asset: 'WTTS-GBBV5CF7UPA2PYRPA632URLB55BWML7X4H33ZRCDWMTULOXDGPHJR5VI', NAV: 9.833 }, // WTTSX
   { asset: 'TIPS-GAJ4KSYLVBJKQ4UBPKJJXPYWVIRZWVTIYRMHBXTHGCDS4XJXXYEUALVD', NAV: 9.662 }, // TIPSX
   { asset: 'WTST-GDEBI5X7J4IDXCSVV3KPFZIHQRCBVF3DAZMS5H7KYOBK45T6XYGDE77P', NAV: 9.511 }, // WTSTX
   { asset: 'WTLG-GAK7PE7DD4ZRJQN3VBCQFBKFV53JGUM2SQATQAKLFK6MVONPGNYK34XH', NAV: 8.645 }, // WTLGX
   { asset: 'SPXU-GDJBVX3QA5HJPBSAU5VIX2W6MC37NU4UFXPKEGK42SJCYN6AEQ4Z6COM', NAV: 15.815 }, // SPXUX
   { asset: 'WTSI-GAD22PDBRFEMXAKPFDP4JGDFWKKD6VPXWUWEAXBS6ZYJYFFQDUN7HAFG', NAV: 10.282 }, // WTSIX
  ],
  ethereum: '0x1fecf3d9d4fee7f2c02917a66028a48c6706c179' // WTGX
}

const stellarTvl = async (api) => {
  const assets = CONFIG[api.chain]
  for (const { asset, NAV } of assets) {
    const supply = await getAssetSupply(asset)
    api.addUSDValue(supply * NAV)
  }
}

const evmTVL = async (api) => {
  const decimals = await api.call({ target: CONFIG[api.chain], abi: 'erc20:decimals' })
  const supply = await api.call({ target: CONFIG[api.chain], abi: 'erc20:totalSupply' })
  api.addUSDValue(supply / 10 ** (decimals))
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl: chain === 'stellar' ? stellarTvl : evmTVL };
});
