let abis = {};

abis.nakedStaking = abis.minABI = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  // decimals
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  //totalSupply
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
];

// Basic yearn vault abi
abis.minYvV2 = [
  // balanceOf
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    type: "function",
  },
  //pricePerShare
  {
    constant: true,
    inputs: [],
    name: "pricePerShare",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
];

abis.compLens = [
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
      {
        internalType: "address payable",
        name: "account",
        type: "address",
      },
    ],
    name: "cTokenBalances",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "balanceOf",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowBalanceCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "balanceOfUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenAllowance",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenBalances",
        name: "",
        type: "tuple",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
      {
        internalType: "address payable",
        name: "account",
        type: "address",
      },
    ],
    name: "cTokenBalancesAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "balanceOf",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowBalanceCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "balanceOfUnderlying",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "tokenAllowance",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenBalances[]",
        name: "",
        type: "tuple[]",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
    ],
    name: "cTokenMetadata",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "exchangeRateCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrows",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalReserves",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalCash",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isListed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "collateralFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "underlyingAssetAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "cTokenDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingDecimals",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenMetadata",
        name: "",
        type: "tuple",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
    ],
    name: "cTokenMetadataAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "exchangeRateCurrent",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "supplyRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "borrowRatePerBlock",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "reserveFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBorrows",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalReserves",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalSupply",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalCash",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "isListed",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "collateralFactorMantissa",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "underlyingAssetAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "cTokenDecimals",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "underlyingDecimals",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenMetadata[]",
        name: "",
        type: "tuple[]",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken",
        name: "cToken",
        type: "address",
      },
    ],
    name: "cTokenUnderlyingPrice",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "underlyingPrice",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenUnderlyingPrice",
        name: "",
        type: "tuple",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract CToken[]",
        name: "cTokens",
        type: "address[]",
      },
    ],
    name: "cTokenUnderlyingPriceAll",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "cToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "underlyingPrice",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CTokenUnderlyingPrice[]",
        name: "",
        type: "tuple[]",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract ComptrollerLensInterface",
        name: "comptroller",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAccountLimits",
    outputs: [
      {
        components: [
          {
            internalType: "contract CToken[]",
            name: "markets",
            type: "address[]",
          },
          {
            internalType: "uint256",
            name: "liquidity",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "shortfall",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.AccountLimits",
        name: "",
        type: "tuple",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        internalType: "contract Comp",
        name: "comp",
        type: "address",
      },
      {
        internalType: "contract ComptrollerLensInterface",
        name: "comptroller",
        type: "address",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getCompBalanceMetadataExt",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "balance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "allocated",
            type: "uint256",
          },
        ],
        internalType: "struct CompoundLens.CompBalanceMetadataExt",
        name: "",
        type: "tuple",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
];

module.exports = {
  abis,
};
