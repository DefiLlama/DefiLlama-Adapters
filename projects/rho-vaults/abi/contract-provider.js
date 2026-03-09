module.exports = {
    getVaultAddressById: {
        name: 'getVaultAddressById',
        type: 'function',
        stateMutability: 'view',
        inputs: [
            {
                internalType: 'VaultId',
                name: 'id',
                type: 'bytes32'
            }
        ],
        outputs: [
            {
                internalType: 'address',
                name: '',
                type: 'address'
            }
        ]
    }
};