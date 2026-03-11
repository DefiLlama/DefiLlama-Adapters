const { getResources } = require("../helper/chain/aptos")
const { getAssetSupply } = require("../helper/chain/stellar")

const BENJI = {
  stellar: '',
  arbitrum: '0xb9e4765bce2609bc1949592059b17ea72fee6c6a',
  polygon: '0x408a634b8a8f0de729b48574a3a7ec3fe820b00a',
  avax: '0xe08b4c1005603427420e64252a8b120cace4d122',
  base: '0x60cfc2b186a4cf647486e42c42b11cc6d571d1e4',
  ethereum: '0x3ddc84940ab509c11b20b76b466933f40b750dc9'
}

const stellarTvl = async (api) => {
  api.addUSDValue(await getAssetSupply('BENJI-GBHNGLLIE3KWGKCHIKMHJ5HVZHYIK7WTBE4QF5PLAKL4CJGSEU7HZIW5'))
}

const evmTVL = async (api) => {
  const [decimals, totalSupply] = await Promise.all([
    api.call({ target: BENJI[api.chain], abi: 'erc20:decimals' }),
    api.call({ target: BENJI[api.chain], abi: 'erc20:totalSupply' })
  ])

  api.addUSDValue((totalSupply / Math.pow(10, decimals)))
}

Object.keys(BENJI).forEach((chain) => {
  module.exports[chain] = { tvl: chain === 'stellar' ? stellarTvl : evmTVL };
});

module.exports.misrepresentedTokens = true;


module.exports.aptos = {
  tvl: async (api) => {
    const res = await getResources('0x7b5e9cac3433e9202f28527f707c89e1e47b19de2c33e4db9521a63ad219b739', api.chain)
    const supply = res.find(i => i.type === '0x1::fungible_asset::ConcurrentSupply').data.current.value
    api.addUSDValue(supply/1e9) 
  }
}