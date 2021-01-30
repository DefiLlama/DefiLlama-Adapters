let minERC20 = [
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
    }
];

let minVault = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_pid",
                "type": "uint256"
            }
        ],
        "name": "getLiquidityInfo",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "lpSupply",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "nerdAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalNerdAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "tokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalTokenAmount",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lockedLP",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "totalLockedLP",
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
        "name": "poolInfo",
        "outputs": [
            {
                "internalType": "contract IERC20",
                "name": "token",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "allocPoint",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "accNerdPerShare",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "lockedPeriod",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "emergencyWithdrawable",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "rewardsInThisEpoch",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "cumulativeRewardsSinceStart",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "startBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "epochCalculationStartBlock",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "poolLength",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

let minRouter = [
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "amountIn",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "path",
                "type": "address[]"
            }
        ],
        "name": "getAmountsOut",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "amounts",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

module.exports = {
    minERC20,
    minVault,
    minRouter
}
