const ETH_VAULT_ADDRESS = '0x0b4EC936DE78833Fc3944df6277734b0517A181e';
const USDC_VAULT_ADDRESS = '0x539201a389aD9b18F4DA95ff7C7C1d8C3FCbB3Ba';

const VAULT_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "ethDeposited",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "ethWithdrawn",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "slashingAmount",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "rewardsClaimed",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "stableDeposited",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "stableWithdrawn",
    "outputs": [{"name": "", "type": "uint256"}],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

async function fetchVaultData(api, vaultAddress, depositedFn, withdrawnFn, rewardsFn, slashingFn) {
  const [deposited, withdrawn, rewards, slashing] = await Promise.all([
    api.call({ abi: VAULT_ABI.find(f => f.name === depositedFn), target: vaultAddress }),
    api.call({ abi: VAULT_ABI.find(f => f.name === withdrawnFn), target: vaultAddress }),
    api.call({ abi: VAULT_ABI.find(f => f.name === rewardsFn), target: vaultAddress }),
    api.call({ abi: VAULT_ABI.find(f => f.name === slashingFn), target: vaultAddress }),
  ]);

  return deposited.add(rewards).sub(withdrawn).sub(slashing);
}

async function tvl(api) {
  const ethTVL = await fetchVaultData(api, ETH_VAULT_ADDRESS, 'ethDeposited', 'ethWithdrawn', 'rewardsClaimed', 'slashingAmount');
  const usdcTVL = await fetchVaultData(api, USDC_VAULT_ADDRESS, 'stableDeposited', 'stableWithdrawn', 'rewardsClaimed', 'slashingAmount');

  api.add('0x0000000000000000000000000000000000000000', ethTVL); // ETH address
  api.add('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', usdcTVL); // USDC address on Ethereum
}

module.exports = {
  methodology: 'Calculates TVL as Deposited + RewardsClaimed - Withdrawn - SlashingAmount from the specified Ethereum and USDC vault contracts.',
  start: 0,
  ethereum: {
    tvl,
  },
};

