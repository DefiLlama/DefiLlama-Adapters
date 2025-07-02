const FusionAbi = [
    {
        "type": "function",
        "name": "total_assets",
        "inputs": [],
        "outputs": [
          {
            "type": "core::integer::u256"
          }
        ],
        "state_mutability": "view"
    },
]

const FusionAbiMap = {}
FusionAbi.forEach(i => FusionAbiMap[i.name] = i)

module.exports = {
    FusionAbiMap
}