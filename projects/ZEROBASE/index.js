const CONFIG = {
  ethereum: {
    vault: '0x9eF52D8953d184840F2c69096B7b3A7dA7093685',
    tokens: ['0xdAC17F958D2ee523a2206206994597C13D831ec7', '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48']
  },
  bsc: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: ['0x55d398326f99059fF775485246999027B3197955', '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d']
  },
  polygon: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: ['0xc2132D05D31c914a87C6611C10748AEb04B58e8F', '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359']
  },
  arbitrum: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: ['0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', '0xaf88d065e77c8cC2239327C5EDb3A432268e5831']
  },
  optimism: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: ['0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85']
  },
  avax: {
    vault: '0xC3e9006559cB209a987e99257986aA5Ce324F829',
    tokens: ['0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7', '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E']
  },
  base: {
    vault: '0xCc5Df5C68d8c991035B6A437D4e00A99875228E4',
    tokens: ['0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913']
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
