
module.exports = {
  version: '0.0.0',
  name: 'borrow_lending',
  instructions: [],
  accounts: [
    {
      name: 'MainAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'tokens',
            type: {
              array: [
                {
                  defined: 'TokenData',
                },
                64,
              ],
            },
          },
          {
            name: 'balances',
            type: {
              array: [
                {
                  defined: 'BalanceTs',
                },
                64,
              ],
            },
          },
          {
            name: 'prices',
            type: {
              array: [
                {
                  defined: 'PriceTs',
                },
                64,
              ],
            },
          },
          {
            name: 'signerBump',
            type: 'u8',
          },
          {
            name: 'priceAuthority',
            type: 'publicKey',
          },
          {
            name: 'padding',
            type: {
              array: [
                'u8',
                992,
              ],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'Balance',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'depositTotal',
            type: 'u128',
          },
          {
            name: 'borrowTotal',
            type: 'u128',
          },
          {
            name: 'depositShares',
            type: 'u128',
          },
          {
            name: 'borrowShares',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'BalanceTs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'balance',
            type: {
              defined: 'Balance',
            },
          },
          {
            name: 'ts',
            type: 'i64',
          },
        ],
      },
    },
    {
      name: 'TokenData',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'mint',
            type: 'publicKey',
          },
          {
            name: 'decimals',
            type: 'u8',
          },
        ],
      },
    },
    {
      name: 'PriceTs',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'price',
            type: 'u128',
          },
          {
            name: 'ts',
            type: 'i64',
          },
        ],
      },
    },
  ],
  errors: [],
};
