const ADDRESSES = require('../helper/coreAssets.json')
const axios= require('axios')

const USDT = ADDRESSES.ethereum.USDT

const CONFIG = {
  stellar: [
   { ticker: "WTGX", address: 'GDMBNMFJ3TRFLASJ6UGETFME3PJPNKPU24C7KFDBEBPQFG2CI6UC3JG6' }, // WTGX
   { ticker: "FLTT", address: 'GBTZKH3RNKW46XEZNCGZEBAGJISKDZKQXKSQ2N5G5SFX36TLWKKR6QJ6' }, // FLTTX
   { ticker: "WTSY", address: 'GB3ZUC7FGDEEBXY3BDEJWMPNGBFA66YRI4QQT6PBO3ZT6F33S7RL36VF' }, // WTSYX
   { ticker: "WTTS", address: 'GBBV5CF7UPA2PYRPA632URLB55BWML7X4H33ZRCDWMTULOXDGPHJR5VI' }, // WTTSX
   { ticker: "TIPS", address: 'GAJ4KSYLVBJKQ4UBPKJJXPYWVIRZWVTIYRMHBXTHGCDS4XJXXYEUALVD' }, // TIPSX
   { ticker: "WTST", address: 'GDEBI5X7J4IDXCSVV3KPFZIHQRCBVF3DAZMS5H7KYOBK45T6XYGDE77P' }, // WTSTX
   { ticker: "WTLG", address: 'GAK7PE7DD4ZRJQN3VBCQFBKFV53JGUM2SQATQAKLFK6MVONPGNYK34XH' }, // WTLGX
   { ticker: "SPXU", address: 'GDJBVX3QA5HJPBSAU5VIX2W6MC37NU4UFXPKEGK42SJCYN6AEQ4Z6COM' }, // SPXUX
   { ticker: "WTSI", address: 'GAD22PDBRFEMXAKPFDP4JGDFWKKD6VPXWUWEAXBS6ZYJYFFQDUN7HAFG' }, // WTSIX
  ],
  ethereum: '0x1fecf3d9d4fee7f2c02917a66028a48c6706c179'
}

const stellarTvl = async (api) => {
  const assets = CONFIG[api.chain]
  for (const { ticker, address } of assets) {
    const stellarApi = `https://api.stellar.expert/explorer/public/asset/${ticker}-${address}`
    const { data } = await axios.get(stellarApi)
    api.add(USDT, data.supply * 10 ** (6-7), { skipChain: true })
  }
}

const evmTVL = async (api) => {
  const decimals = await api.call({ target: CONFIG[api.chain], abi: 'erc20:decimals' })
  const supply = await api.call({ target: CONFIG[api.chain], abi: 'erc20:totalSupply' })
  api.add(USDT, supply * 10 ** (6-decimals))
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl: chain === 'stellar' ? stellarTvl : evmTVL };
});
