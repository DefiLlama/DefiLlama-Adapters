const VAULT_FACTORY_ABI = 'event VaultCreated(address vault,address to)'

const SINGLE_SIDED_STAKING_ABI = [
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [
    {
      "name": "",
      "type": "uint256",
      "internalType": "uint256"
    }
    ],
    "stateMutability": "view"
  }
]


module.exports = {
  VAULT_FACTORY_ABI,
  SINGLE_SIDED_STAKING_ABI
};
