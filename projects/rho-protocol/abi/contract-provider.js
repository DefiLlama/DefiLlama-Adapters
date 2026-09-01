module.exports = {
    getMarketAddresses: {
        name: 'getMarketAddresses',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                internalType: 'uint256',
                name: 'offset',
                type: 'uint256',
            },
            {
                internalType: 'uint256',
                name: 'limit',
                type: 'uint256',
            },
        ],
        outputs: [
            {
                internalType: 'address[]',
                name: 'result',
                type: 'address[]',
            },
        ],
    },
};