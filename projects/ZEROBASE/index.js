const ADDRESSES = require('../helper/coreAssets.json')
const CONFIG = {
  ethereum: {
    vault: '0x9eF52D8953d184840F2c69096B7b3A7dA7093685',
    tokens: [ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC]
  },
  bsc: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: [ADDRESSES.bsc.USDT, ADDRESSES.bsc.USDC]
  },
  polygon: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: [ADDRESSES.polygon.USDT, ADDRESSES.polygon.USDC_CIRCLE]
  },
  arbitrum: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: [ADDRESSES.arbitrum.USDT, ADDRESSES.arbitrum.USDC_CIRCLE]
  },
  optimism: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: [ADDRESSES.optimism.USDT, ADDRESSES.optimism.USDC_CIRCLE]
  },
  avax: {
    vault: '0xC3e9006559cB209a987e99257986aA5Ce324F829',
    tokens: [ADDRESSES.avax.USDt, ADDRESSES.avax.USDC]
  },
  base: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: [ADDRESSES.base.USDC]
  }
}

const abis = {
  getTVL: "function getTVL(address _token) view returns (uint256)"
}

module.exports = {
  methodology: 'For each chain: call getTVL(token) on its vault and sum per-token amounts',
}

const tvl = async (api) => {
  const { vault, tokens } = CONFIG[api.chain]
  const balances = await api.multiCall({ abi: abis.getTVL, calls: tokens.map((t) => ({ target: vault, params: [t]})) })
  tokens.forEach((t, i) => { api.add(t, balances[i]) })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})
