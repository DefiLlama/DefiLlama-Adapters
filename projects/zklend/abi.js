const market = [
    {
      "name": "get_total_debt_for_token",
      "type": "function",
      "inputs": [
        {
          "name": "token",
          "type": "felt"
        }
      ],
      "outputs": [
        {
          "name": "debt",
          "type": "felt"
        }
      ],
      "stateMutability": "view"
    },
]
const marketAbi = {}
market.forEach(i => marketAbi[i.name] = i)

module.exports = {
  marketAbi
}