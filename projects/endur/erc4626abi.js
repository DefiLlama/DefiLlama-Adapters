const ERC4626Abi = [
    {
      "name": "asset",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ],
      "state_mutability": "view"
    },
    {
      "name": "balanceOf",
      "type": "function",
      "inputs": [
        {
          "name": "account",
          "type": "core::starknet::contract_address::ContractAddress"
        }
      ],
      "outputs": [
        {
          "type": "core::integer::u256"
        }
      ],
      "state_mutability": "view",
      "customInput": 'address',
    },
    {
      "name": "total_assets",
      "type": "function",
      "inputs": [],
      "outputs": [
        {
          "type": "core::integer::u256"
        }
      ],
      "state_mutability": "view"
    }
]
  
const ERC4626AbiMap = {}
ERC4626Abi.forEach(i => ERC4626AbiMap[i.name] = i)
  
module.exports = {
    ERC4626AbiMap
}