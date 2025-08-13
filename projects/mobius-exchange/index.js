const LP_TOKEN_CONFIG = [
  // Stable pool
  { tokenSymbol: 'USDe', lpToken: '0x362F4D6F539201dB13A7305369a48FaC58960be5', token: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34' },
  { tokenSymbol: 'USDC', lpToken: '0xb8Ca9787Cf03c6f1fA6ef207aB93e875F3B84426', token: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9' },
  { tokenSymbol: 'USDT', lpToken: '0x6A7D252b807887AfEE870d14C5D7eb25f00A7044', token: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE' },
  // cmETH pool
  { tokenSymbol: 'cmETH', lpToken: '0x801f29bB8fa066b71bF2f4e1Af34D7E4682cCecc', token: '0xE6829d9a7eE3040e1276Fa75293Bde931859e8fA' },
  { tokenSymbol: 'mETH', lpToken: '0x88837Ef995907016C5ca0776693f6B2339A44E35', token: '0xcDA86A272531e8640cD7F1a92c01839911B90bb0' },
  { tokenSymbol: 'WETH', lpToken: '0x6d01Ad49e74aa488EB293c1869D4aCDC39359B4b', token: '0xdEAddEaDdeadDEadDEADDEAddEADDEAddead1111' },
]

async function tvl(api) {
  const calls = LP_TOKEN_CONFIG.map((config) => ({
    target: config.token,
    params: [config.lpToken],
  }));

  const balances = await api.multiCall({
    calls,
    abi: 'erc20:balanceOf',
    requery: true,
  });

  const tokens = LP_TOKEN_CONFIG.map((config) => config.token);
  api.addTokens(tokens, balances);
}

module.exports = {
  methodology: 'counts the total balance of underlying tokens stored in the LP token contracts',
  start: 82410000,
  mantle: {
    tvl,
  }
}; 