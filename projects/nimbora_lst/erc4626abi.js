const ERC4626Abi = [
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