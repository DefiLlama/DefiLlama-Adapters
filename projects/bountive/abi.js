const bountiveToken = [
    {
        "type": "function",
        "name": "total_supply",
        "inputs": [],
        "outputs": [
            {
                "type": "core::integer::u256"
            }
        ],
        "state_mutability": "view"
    }
]
  
const bountiveTokenAbi = {}
bountiveToken.forEach(i => bountiveTokenAbi[i.name] = i)

module.exports = {
    bountiveTokenAbi
}