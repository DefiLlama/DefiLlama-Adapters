const ADDRESSES = require('../helper/coreAssets.json')
const STRATEGIES = [
  {
    name: "ABSOLUTE_RETURN",
    vault: '0x5C4a6903732532eeB3AE0803e062d8AE25d52BD1',
    tokens: [ADDRESSES.bsc.USDT]
  },
  {
    name: "CORE_ALPHA",
    vault: '0xb82E32062C773c7748776C06FdB11B92EDAE3B63',
    tokens: [ADDRESSES.bsc.USDT]
  }
]

const abis = {
  getTVL: "function getTVL(address _token) external view returns (uint256)"
}

const tvl = async (api) => {
  for (const { vault, tokens } of STRATEGIES) {
    const calls = tokens.map(token => ({ target: vault, params: [token] }));
    const balances = await api.multiCall({
      abi: abis.getTVL,
      calls
    });
    tokens.forEach((token, i) => {
      api.add(token, balances[i]);
    });
  }
}

module.exports = {
  methodology: 'For each strategy: call getTVL(token) on its vault and sum per-token amounts',
  bsc: { tvl }
}
