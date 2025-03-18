const USDC_STRATEGY_ADDRESS = '0xA2b648cE3ECFCa0BdE6eF353169cE97c4CcBE127';
const DAI_STRATEGY_ADDRESS = '0xFf222313F328a9A555f068137e08e85b6aAe214A';
const STRATEGY_MANAGER_ADDRESS = '0x751b60E27B6a722c0d1D1a48446DA0e52618228E';

const VAULT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_strategy",
        "type": "address"
      }
    ],
    "name": "fetchStrategyDeposit",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "valueDeposited", "type": "uint256" },
          { "internalType": "uint256", "name": "rewardsEarned", "type": "uint256" },
          { "internalType": "uint256", "name": "amountSlashed", "type": "uint256" },
          { "internalType": "uint256", "name": "valueWithdrawn", "type": "uint256" }
        ],
        "internalType": "struct IStrategyManager.StrategyStruct",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

async function fetchVaultData(api, strategyAddress, strategyManagerAddress) {
  const { valueDeposited, rewardsEarned, amountSlashed, valueWithdrawn } = await api.call({
    abi: VAULT_ABI.find(f => f.name === "fetchStrategyDeposit"),
    target: strategyManagerAddress,
    params: [strategyAddress]
  });

  return valueDeposited.add(rewardsEarned).sub(valueWithdrawn).sub(amountSlashed);
}

async function tvl(api) {
  const usdcTVL = await fetchVaultData(api, USDC_STRATEGY_ADDRESS, STRATEGY_MANAGER_ADDRESS);
  const daiTVL = await fetchVaultData(api, DAI_STRATEGY_ADDRESS, STRATEGY_MANAGER_ADDRESS);

  api.add('0x6B175474E89094C44Da98b954EedeAC495271d0F', daiTVL); // DAI address on Ethereum
  api.add('0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', usdcTVL); // USDC address on Ethereum
}

module.exports = {
  methodology: 'Calculates TVL as Deposited + RewardsEarned - Withdrawn - SlashingAmount from the specified Ethereum and USDC vault contracts.',
  start: 21986569,
  ethereum: {
    tvl,
  },
};
