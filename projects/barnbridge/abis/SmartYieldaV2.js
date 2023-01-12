module.exports = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'providerBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'AddLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BondIssued',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewards',
        type: 'uint256',
      },
    ],
    name: 'BondRedeemed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'oldBond',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'newBond',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'oldAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'newAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'fee',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'rewards',
        type: 'uint256',
      },
    ],
    name: 'BondRolledOver',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'BondWithdrawn',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'nextId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'borrowAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint40',
            name: 'start',
            type: 'uint40',
          },
          {
            internalType: 'uint128',
            name: 'borrowRate',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'collateralBond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum SmartYieldaV2.DebtStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'borrower',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.Debt',
        name: 'debt',
        type: 'tuple',
      },
    ],
    name: 'Borrowed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'uint8',
        name: 'version',
        type: 'uint8',
      },
    ],
    name: 'Initialized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeRate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nextTerm',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'bond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'realizedYield',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'liquidated',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.TermInfo',
        name: 'term',
        type: 'tuple',
      },
    ],
    name: 'InjectedRealizedYield',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'borrowAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint40',
            name: 'start',
            type: 'uint40',
          },
          {
            internalType: 'uint128',
            name: 'borrowRate',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'collateralBond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum SmartYieldaV2.DebtStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'borrower',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.Debt',
        name: 'debt',
        type: 'tuple',
      },
    ],
    name: 'Liquidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'providerBalance',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'RemoveLiquidity',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'debtId',
        type: 'uint256',
      },
      {
        components: [
          {
            internalType: 'address',
            name: 'borrowAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint40',
            name: 'start',
            type: 'uint40',
          },
          {
            internalType: 'uint128',
            name: 'borrowRate',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'collateralBond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum SmartYieldaV2.DebtStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'borrower',
            type: 'address',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.Debt',
        name: 'debt',
        type: 'tuple',
      },
    ],
    name: 'Repaied',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'user',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'claimedAmounts',
        type: 'uint256',
      },
    ],
    name: 'RewardsClaimed',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeRate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nextTerm',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'bond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'realizedYield',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'liquidated',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.TermInfo',
        name: 'nextTerm',
        type: 'tuple',
      },
    ],
    name: 'TermLiquidated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'controller',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeRate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nextTerm',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'bond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'realizedYield',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'liquidated',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.TermInfo',
        name: 'currentTerm',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'uint256',
            name: 'start',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'end',
            type: 'uint256',
          },
          {
            internalType: 'uint256',
            name: 'feeRate',
            type: 'uint256',
          },
          {
            internalType: 'address',
            name: 'nextTerm',
            type: 'address',
          },
          {
            internalType: 'address',
            name: 'bond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'realizedYield',
            type: 'uint256',
          },
          {
            internalType: 'bool',
            name: 'liquidated',
            type: 'bool',
          },
        ],
        indexed: false,
        internalType: 'struct SmartYieldaV2.TermInfo',
        name: 'term',
        type: 'tuple',
      },
    ],
    name: 'TermSetUp',
    type: 'event',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'borrowAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint40',
            name: 'start',
            type: 'uint40',
          },
          {
            internalType: 'uint128',
            name: 'borrowRate',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'collateralBond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum SmartYieldaV2.DebtStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'borrower',
            type: 'address',
          },
        ],
        internalType: 'struct SmartYieldaV2.Debt',
        name: '_debt',
        type: 'tuple',
      },
    ],
    name: '_computeHealthFactor',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'address',
            name: 'borrowAsset',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'borrowAmount',
            type: 'uint256',
          },
          {
            internalType: 'uint40',
            name: 'start',
            type: 'uint40',
          },
          {
            internalType: 'uint128',
            name: 'borrowRate',
            type: 'uint128',
          },
          {
            internalType: 'address',
            name: 'collateralBond',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'collateralAmount',
            type: 'uint256',
          },
          {
            internalType: 'enum SmartYieldaV2.DebtStatus',
            name: 'status',
            type: 'uint8',
          },
          {
            internalType: 'address',
            name: 'borrower',
            type: 'address',
          },
        ],
        internalType: 'struct SmartYieldaV2.Debt',
        name: '_debt',
        type: 'tuple',
      },
    ],
    name: '_computeLtv',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: '_currentRealizedYield',
    outputs: [
      {
        internalType: 'uint256',
        name: '_realizedYield',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'activeTerm',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'addLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    name: 'bondData',
    outputs: [
      {
        internalType: 'uint256',
        name: 'start',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'end',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'feeRate',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: 'nextTerm',
        type: 'address',
      },
      {
        internalType: 'address',
        name: 'bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'realizedYield',
        type: 'uint256',
      },
      {
        internalType: 'bool',
        name: 'liquidated',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bondProvider',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'bondTokenImpl',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_bondAmount',
        type: 'uint256',
      },
      {
        internalType: 'address',
        name: '_borrowAsset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_borrowAmount',
        type: 'uint256',
      },
    ],
    name: 'borrow',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'buyBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_to',
        type: 'address',
      },
    ],
    name: 'claimReward',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'controller',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'debtData',
    outputs: [
      {
        internalType: 'address',
        name: 'borrowAsset',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'borrowAmount',
        type: 'uint256',
      },
      {
        internalType: 'uint40',
        name: 'start',
        type: 'uint40',
      },
      {
        internalType: 'uint128',
        name: 'borrowRate',
        type: 'uint128',
      },
      {
        internalType: 'address',
        name: 'collateralBond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: 'collateralAmount',
        type: 'uint256',
      },
      {
        internalType: 'enum SmartYieldaV2.DebtStatus',
        name: 'status',
        type: 'uint8',
      },
      {
        internalType: 'address',
        name: 'borrower',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_asset',
        type: 'address',
      },
    ],
    name: 'disableBorrowAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_asset',
        type: 'address',
      },
    ],
    name: 'enableBorrowAsset',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_debtId',
        type: 'uint256',
      },
    ],
    name: 'getHealthFactor',
    outputs: [
      {
        internalType: 'uint256',
        name: 'healthFactor',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: 'compoundedBalance',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'healthFactorGuard',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_controller',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_aToken',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_providerImpl',
        type: 'address',
      },
      {
        internalType: 'address',
        name: '_bondTokenImpl',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_withdrawWindow',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_healthFactorGuard',
        type: 'uint256',
      },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_debtId',
        type: 'uint256',
      },
    ],
    name: 'liquidateDebt',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
    ],
    name: 'liquidateTerm',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'liquidityProviderBalance',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'paused',
    outputs: [
      {
        internalType: 'bool',
        name: '',
        type: 'bool',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'provideRealizedYield',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'redeemBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'removeLiquidity',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_debtId',
        type: 'uint256',
      },
    ],
    name: 'repay',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_tokenAmount',
        type: 'uint256',
      },
    ],
    name: 'rolloverBond',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_healthFactorGuard',
        type: 'uint256',
      },
    ],
    name: 'setHealthFactorGuard',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'uint256',
        name: '_start',
        type: 'uint256',
      },
      {
        internalType: 'uint16',
        name: '_termLength',
        type: 'uint16',
      },
      {
        internalType: 'uint16',
        name: '_feeRate',
        type: 'uint16',
      },
      {
        internalType: 'address',
        name: '_currentTerm',
        type: 'address',
      },
    ],
    name: 'setNextTermFor',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bool',
        name: '_paused',
        type: 'bool',
      },
    ],
    name: 'setPaused',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_asset',
        type: 'address',
      },
      {
        internalType: 'bool',
        name: '_useAsCollateral',
        type: 'bool',
      },
    ],
    name: 'setUserUseReserveAsCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_vault',
        type: 'address',
      },
    ],
    name: 'setVault',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'underlying',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'vault',
    outputs: [
      {
        internalType: 'address',
        name: '',
        type: 'address',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: '_bond',
        type: 'address',
      },
      {
        internalType: 'uint256',
        name: '_withdrawAmount',
        type: 'uint256',
      },
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'withdrawWindow',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
];
