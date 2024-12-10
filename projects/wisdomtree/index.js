const ADDRESSES = require('../helper/coreAssets.json')
const axios= require('axios')

const USDT = ADDRESSES.ethereum.USDT

const CONFIG = {
  stellar: { ticker: "WTGX", address: 'GDMBNMFJ3TRFLASJ6UGETFME3PJPNKPU24C7KFDBEBPQFG2CI6UC3JG6' },
  ethereum: '0x1fecf3d9d4fee7f2c02917a66028a48c6706c179'
}

const stellarTvl = async (api) => {
  const { ticker, address } = CONFIG[api.chain]
  const stellarApi = `https://api.stellar.expert/explorer/public/asset/${ticker}-${address}`
  const { data } = await axios.get(stellarApi)
  api.add(USDT, data.supply * 10 ** (6-7), { skipChain: true })
}

const evmTVL = async (api) => {
  const decimals = await api.call({ target: CONFIG[api.chain], abi: 'erc20:decimals' })
  const supply = await api.call({ target: CONFIG[api.chain], abi: 'erc20:totalSupply' })
  api.add(USDT, supply * 10 ** (6-decimals))
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl: chain === 'stellar' ? stellarTvl : evmTVL };
});
