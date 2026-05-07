const ADDRESSES = require('../helper/coreAssets.json');
const AMPLIFY_VAULT = '0x89678540206E7d6964a4e22aE5Cf4ac55926651A'; //AmplifyFinance Amplified ETH vault

async function tvl(api) {
  // Get all strategies inside the vault
  const strategies = await api.call({ abi: "address[]:get_default_queue", target: AMPLIFY_VAULT, });

  // Get collateral balance for each strategy
  const collateralBalances = await api.multiCall({ abi: "uint256:balanceOfCollateral", calls: strategies, });

  // Add the collateral balances as wstETH to the balances
  api.add(ADDRESSES.ethereum.WSTETH, collateralBalances);
}

module.exports = {
  methodology: 'Calculates TVL by summing balanceOfCollateral() across all strategies in the vault\'s default queue, denominated in wstETH.',
  ethereum: {
    tvl,
  }
};
