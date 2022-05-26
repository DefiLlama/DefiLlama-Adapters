let abis = {};

abis.smoothy = [
    {
        "inputs": [],
        "name": "_ntokens",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bTokenIdx",
                "type": "uint256"
            }
        ],
        "name": "getTokenStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "softWeight",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "hardWeight",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "balance",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "decimals",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
];


abis.tokens = [
    {
        symbol: "USDT",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        id: 0,
        decimals: 6,
    },
    {
        symbol: "USDC",
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        id: 1,
        decimals: 6,
    },
    {
        symbol: "DAI",
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        id: 2,
        decimals: 18,
    },
    {
        symbol: "TUSD",
        address: "0x0000000000085d4780B73119b644AE5ecd22b376",
        id: 3,
        decimals: 18,
    },
    {
        symbol: "sUSD",
        address: "0x57ab1ec28d129707052df4df418d58a2d46d5f51",
        id: 4,
        decimals: 18,
    },
    {
        symbol: "BUSD",
        address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
        id: 5,
        decimals: 18,
    },
    {
        symbol: "PAX",
        address: "0x8e870d67f660d95d5be530380d0ec0bd388289e1",
        id: 6,
        decimals: 18,
    },
    {
        symbol: "GUSD",
        address: "0x056fd409e1d7a124bd7017459dfea2f387b6d5cd",
        id: 7,
        decimals: 2,
    },
];

module.exports = {
    abis
}
