const ADDRESSES = require('../helper/coreAssets.json')
const STRATEGIES = {
  ABSOLUTE_RETURN: {
    vault: '0x5C4a6903732532eeB3AE0803e062d8AE25d52BD1',
    tokens: [ADDRESSES.bsc.USDT]
  },
  CORE_ALPHA: {
    vault: '0xb82E32062C773c7748776C06FdB11B92EDAE3B63',
    tokens: [ADDRESSES.bsc.USDT]
  }
}

const abis = {
  getTVL: "function getTVL(address _token) external view returns (uint256)"
}

const tvl = async (api) => {
  // for strategy absolute_return
  let vault = STRATEGIES.ABSOLUTE_RETURN.vault
  let tokens = STRATEGIES.ABSOLUTE_RETURN.tokens
  let balances = await api.multiCall({ abi: abis.getTVL, calls: tokens.map((t) => ({ target: vault, params: [t]})) })
  tokens.forEach((t, i) => { api.add(t, balances[i]) })

  // for strategy core_alpha
  vault = STRATEGIES.CORE_ALPHA.vault
  tokens = STRATEGIES.CORE_ALPHA.tokens
  balances = await api.multiCall({ abi: abis.getTVL, calls: tokens.map((t) => ({ target: vault, params: [t]})) })
  tokens.forEach((t, i) => { api.add(t, balances[i]) })
}

module.exports = {
  methodology: 'For each strategy and token: call getTVL(token) on its vault and sum per-token amounts',
  bsc: { tvl }
}
