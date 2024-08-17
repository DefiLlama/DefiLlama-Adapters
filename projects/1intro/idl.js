module.exports = {
  "version": "0.1.0",
  "name": "1dex",
  "instructions": [],
  "accounts": [
    {
      name: 'PoolState',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'poolAuthPdaKey',
            type: 'publicKey'
          },
          {
            name: 'poolAuthPdaBump',
            type: 'u8'
          },
          {
            name: 'poolLpMintKey',
            type: 'publicKey'
          },
          {
            name: 'poolLpVirtualSupply',
            type: 'u64'
          },
          {
            name: 'poolTokenCount',
            type: 'u64'
          },
          {
            name: 'poolTokenArray',
            type: {
              array: [
                {
                  defined: 'TokenRecord'
                },
                4
              ]
            }
          },
          {
            name: 'poolTokenTotalWeight',
            type: 'u64'
          },
          {
            name: 'poolSwapFeeRatio',
            type: 'u64'
          }
        ]
      }
    }
  ],
  "types": [
    {
      name: 'TokenRecord',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mintKey',
            type: 'publicKey'
          },
          {
            name: 'accountKey',
            type: 'publicKey'
          },
          {
            name: 'balance',
            type: 'u64'
          },
          {
            name: 'weight',
            type: 'u64'
          }
        ]
      }
    }],
  "errors": [],
  "metadata": {
    "address": "DEXYosS6oEGvk8uCDayvwEZz4qEyDJRf9nFgYCaqPMTm"
  }
}