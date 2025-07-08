const EkuboAbi = [
    {
        "name": "total_supply",
        "type": "function",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
    },
    {
        "name": "convert_to_assets",
        "type": "function",
        "inputs": [
          {
            "name": "shares",
            "type": "core::integer::u256"
          }
        ],
        "outputs": [
          {
            "type": "(core::integer::u256, core::integer::u256, core::integer::u256)"
          }
        ],
        "state_mutability": "view"
      },
] 

const EkuboAbiMap = {}
EkuboAbi.forEach(i => EkuboAbiMap[i.name] = i)

module.exports = {
    EkuboAbiMap
}