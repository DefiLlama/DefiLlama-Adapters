const AMPLIFY_VAULT = '0x89678540206E7d6964a4e22aE5Cf4ac55926651A'; //AmplifyFinance Amplified ETH vault
const WSTETH_TOKEN = '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0'; // wstETH on Ethereum

// ABI for the vault function to retrieve all strategies in the vault
const VAULT_ABI = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "get_default_queue",
    "inputs": [],
    "outputs": [{"name": "", "type": "address[]"}]
  }
];

// ABI for strategy balanceOfCollateral function
const STRATEGY_ABI = [
  {
    "stateMutability": "view",
    "type": "function",
    "name": "balanceOfCollateral",
    "inputs": [],
    "outputs": [{"name": "", "type": "uint256"}]
  }
];

async function tvl(api) {
  // Get all strategies inside the vault
  const strategies = await api.call({
    abi: VAULT_ABI.find(f => f.name === 'get_default_queue'),
    target: AMPLIFY_VAULT,
  });

  // If no strategies, return 0 TVL
  if (!strategies || strategies.length === 0) {
    return;
  }

  // Get collateral balance for each strategy
  const collateralBalances = await api.multiCall({
    abi: STRATEGY_ABI.find(f => f.name === 'balanceOfCollateral'),
    calls: strategies.map(strategy => ({ target: strategy })),
  });

  // Sum up all collateral balances
  let totalCollateral = 0n;
  for (const balance of collateralBalances) {
    if (balance) {
      totalCollateral += BigInt(balance);
    }
  }

  // Add the total collateral as wstETH to the balances
  api.add(WSTETH_TOKEN, totalCollateral.toString());
}

module.exports = {
  methodology: 'Calculates TVL by summing balanceOfCollateral() across all strategies in the vault\'s default queue, denominated in wstETH.',
  ethereum: {
    tvl,
  }
};