
module.exports = {
  version: '0.0.0',
  name: 'borrow_lending',
  instructions: [
    {
      name: 'initializeMain',
      accounts: [
        {
          name: 'mainSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'priceAuthority',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'signerBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setPriceAuthority',
      accounts: [
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'newPriceAuthority',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'initializeMargin',
      accounts: [
        {
          name: 'marginAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'marginBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'deposit',
      accounts: [
        {
          name: 'marginAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'from',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'to',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'quantity',
          type: 'u64',
        },
        {
          name: 'vaultBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'withdraw',
      accounts: [
        {
          name: 'marginAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mainSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'from',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'to',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'quantity',
          type: 'u64',
        },
        {
          name: 'vaultBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'liquidate',
      accounts: [
        {
          name: 'liquidateeAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'liquidatorAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'crankInterest',
      accounts: [
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenParamsAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'tpaBump',
          type: 'u8',
        },
        {
          name: 'tokenIds',
          type: {
            array: [
              'u8',
              16,
            ],
          },
        },
      ],
    },
    {
      name: 'setPrice',
      accounts: [
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'priceAuthority',
          isMut: false,
          isSigner: true,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'tokenIds',
          type: {
            array: [
              'u8',
              16,
            ],
          },
        },
        {
          name: 'prices',
          type: {
            array: [
              'u128',
              16,
            ],
          },
        },
      ],
    },
    {
      name: 'crankPrice',
      accounts: [],
      args: [
        {
          name: 'tokenIds',
          type: {
            array: [
              'u8',
              16,
            ],
          },
        },
      ],
    },
    {
      name: 'addToken',
      accounts: [
        {
          name: 'mainSigner',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'feeVault',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'mint',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'clock',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'vaultBump',
          type: 'u8',
        },
        {
          name: 'feeBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'initTokenParameters',
      accounts: [
        {
          name: 'mainAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'tokenParamsAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'rent',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'tpaBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'setTokenParameters',
      accounts: [
        {
          name: 'mainAccount',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'tokenParamsAccount',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'authority',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'tpaBump',
          type: 'u8',
        },
        {
          name: 'tokenId',
          type: 'u8',
        },
        {
          name: 'uOptimal',
          type: 'u16',
        },
        {
          name: 'baseRate',
          type: 'u16',
        },
        {
          name: 'slopeOne',
          type: 'u16',
        },
        {
          name: 'slopeTwo',
          type: 'u16',
        },
      ],
    },
  ],
  accounts: [
    {
      name: 'MarginAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'tokenShares',
            type: {
              array: [
                {
                  defined: 'TokenShares',
                },
                64,
              ],
            },
          },
          {
            name: 'mainAccount',
            type: 'publicKey',
          },
          {
            name: 'padding',
            type: {
              array: [
                'u8',
                1024,
              ],
            },
          },
        ],
      },
    },
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
    {
      name: 'TokensParametersAccount',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'authority',
            type: 'publicKey',
          },
          {
            name: 'params',
            type: {
              array: [
                {
                  defined: 'TokenParameters',
                },
                64,
              ],
            },
          },
          {
            name: 'rates',
            type: {
              array: [
                {
                  defined: 'TokenRate',
                },
                64,
              ],
            },
          },
          {
            name: 'padding',
            type: {
              array: [
                'u8',
                500,
              ],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: 'TokenShares',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'tokenId',
            type: 'u8',
          },
          {
            name: 'shares',
            type: 'i128',
          },
        ],
      },
    },
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
      name: 'TokenRate',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'borrowApr',
            type: 'u128',
          },
          {
            name: 'depositApy',
            type: 'u128',
          },
        ],
      },
    },
    {
      name: 'TokenParameters',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'uOptimal',
            type: 'u16',
          },
          {
            name: 'baseRate',
            type: 'u16',
          },
          {
            name: 'slopeOne',
            type: 'u16',
          },
          {
            name: 'slopeTwo',
            type: 'u16',
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
