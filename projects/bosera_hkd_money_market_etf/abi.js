const NexaAggregator = [
    {
        "type": "function",
        "name": "latestAnswer",
        "inputs": [],
        "outputs": [
            {
                "type": "int256"
            }
        ],
        "state_mutability": "view"
    },
    {
        "type": "function",
        "name": "decimals",
        "inputs": [],
        "outputs": [
            {
                "type": "uint8"
            }
        ],
        "state_mutability": "view"
    }
]

const NexaAggregatorAbi = {}
NexaAggregator.forEach(i => NexaAggregatorAbi[i.name] = i)

module.exports = {
    NexaAggregatorAbi
}