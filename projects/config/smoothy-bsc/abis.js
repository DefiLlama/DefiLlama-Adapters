let abis = {};

abis.smoothy = [
    {
        "inputs": [
            {
                "internalType": "address[]",
                "name": "tokens",
                "type": "address[]"
            },
            {
                "internalType": "address[]",
                "name": "yTokens",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "decMultipliers",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "inAmounts",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "sTokenMinted",
                "type": "uint256"
            }
        ],
        "name": "Mint",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bTokenAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "sTokenBurn",
                "type": "uint256"
            }
        ],
        "name": "Redeem",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "buyer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bTokenIdIn",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "bTokenIdOut",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "inAmount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "outAmount",
                "type": "uint256"
            }
        ],
        "name": "Swap",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "provider",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "inOutFlag",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "sTokenMintedOrBurned",
                "type": "uint256"
            }
        ],
        "name": "SwapAll",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "_adminFeePct",
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
        "inputs": [],
        "name": "_adminInterestPct",
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
        "inputs": [],
        "name": "_redeemFee",
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
        "inputs": [],
        "name": "_rewardCollector",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_swapFee",
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
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_tokenInfos",
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
        "inputs": [],
        "name": "_totalBalance",
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
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_yBalances",
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
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "_yTokenAddresses",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
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
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
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
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
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
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "pause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "unpause",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newCollector",
                "type": "address"
            }
        ],
        "name": "changeRewardCollector",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "tid",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "newSoftWeight",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "newHardWeight",
                "type": "uint256"
            }
        ],
        "name": "adjustWeights",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "swapFee",
                "type": "uint256"
            }
        ],
        "name": "changeSwapFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "redeemFee",
                "type": "uint256"
            }
        ],
        "name": "changeRedeemFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pct",
                "type": "uint256"
            }
        ],
        "name": "changeAdminFeePct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "pct",
                "type": "uint256"
            }
        ],
        "name": "changeAdminInterestPct",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint8",
                "name": "tid",
                "type": "uint8"
            },
            {
                "internalType": "uint256",
                "name": "bTokenAmount",
                "type": "uint256"
            }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "addr",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "yAddr",
                "type": "address"
            },
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
                "name": "decMultiplier",
                "type": "uint256"
            }
        ],
        "name": "addToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "yAddr",
                "type": "address"
            }
        ],
        "name": "setYEnabled",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "getBalance",
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
                "name": "tid",
                "type": "uint256"
            }
        ],
        "name": "rebalanceReserve",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bTokenIdx",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenAmount",
                "type": "uint256"
            }
        ],
        "name": "getMintAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "lpTokenAmount",
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
            },
            {
                "internalType": "uint256",
                "name": "bTokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lpTokenMintedMin",
                "type": "uint256"
            }
        ],
        "name": "mint",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tid",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lpTokenAmount",
                "type": "uint256"
            }
        ],
        "name": "getRedeemByLpTokenAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "bTokenAmount",
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
            },
            {
                "internalType": "uint256",
                "name": "lpTokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenMin",
                "type": "uint256"
            }
        ],
        "name": "redeemByLpToken",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bTokenIdx",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lpTokenBurnedMax",
                "type": "uint256"
            }
        ],
        "name": "redeem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bTokenIdxIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenIdxOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenInAmount",
                "type": "uint256"
            }
        ],
        "name": "getSwapAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "bTokenOutAmount",
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
                "name": "bTokenIdxIn",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenIdxOut",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenInAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "bTokenOutMin",
                "type": "uint256"
            }
        ],
        "name": "swap",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "inOutFlag",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lpTokenMintedMinOrBurnedMax",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "maxFee",
                "type": "uint256"
            },
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "name": "swapAll",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "collectReward",
        "outputs": [],
        "stateMutability": "nonpayable",
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
    }
];

abis.bsctokens = [
    {
        symbol: "BUSD",
        address: "0xe9e7cea3dedca5984780bafc599bd69add087d56",
        id: 0,
        decimals: 18,
    },
    {
        symbol: "USDT",
        address: "0x55d398326f99059ff775485246999027b3197955",
        id: 1,
        decimals: 18,
    },
    {
        symbol: "USDC",
        address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
        id: 2,
        decimals: 18,
    },
    {
        symbol: "DAI",
        address: "0x1af3f329e8be154074d8769d1ffa4ee058b1dbc3",
        id: 3,
        decimals: 18,
    },
    {
        symbol: "PAX",
        address: "0xb7f8cd00c5a06c0537e2abff0b58033d02e5e094",
        id: 4,
        decimals: 18,
    },
    {
        symbol: "UST",
        address: "0x23396cf899ca06c4472205fc903bdb4de249d6fc",
        id: 5,
        decimals: 18,
    },
];

module.exports = {
    abis
}
