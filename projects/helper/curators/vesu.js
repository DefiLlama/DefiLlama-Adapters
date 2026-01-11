const ADDRESSES = require('../coreAssets.json')

const allAbi = [
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [
      {
        type: "core::integer::u8",
      },
    ],
    state_mutability: "view",
  },
  {
    "type": "function",
    "name": "asset_config_unsafe",
    "inputs": [
      {
        "name": "pool_id",
        "type": "felt"
      },
      {
        "name": "asset",
        "type": "felt"
      }
    ],
    "outputs": [
      {
        "type": "(vesu::data_model::AssetConfig, core::integer::u256)"
      }
    ],
    "state_mutability": "view",
    "customInput": "address"
  },
  {
    "type": "struct",
    "name": "vesu::data_model::AssetConfig",
    "members": [
      {
        "name": "total_collateral_shares",
        "type": "core::integer::u256"
      },
      {
        "name": "total_nominal_debt",
        "type": "core::integer::u256"
      },
      {
        "name": "reserve",
        "type": "core::integer::u256"
      },
      {
        "name": "max_utilization",
        "type": "core::integer::u256"
      },
      {
        "name": "floor",
        "type": "core::integer::u256"
      },
      {
        "name": "scale",
        "type": "core::integer::u256"
      },
      {
        "name": "is_legacy",
        "type": "core::bool"
      },
      {
        "name": "last_updated",
        "type": "core::integer::u64"
      },
      {
        "name": "last_rate_accumulator",
        "type": "core::integer::u256"
      },
      {
        "name": "last_full_utilization_rate",
        "type": "core::integer::u256"
      },
      {
        "name": "fee_rate",
        "type": "core::integer::u256"
      }
    ]
  },
]

const abi = {}
allAbi.forEach(i => abi[i.name] = i)

const assets = [
  ADDRESSES.starknet.ETH,
  ADDRESSES.starknet.WBTC,
  ADDRESSES.starknet.USDC,
  ADDRESSES.starknet.USDT,
  ADDRESSES.starknet.WSTETH,
  ADDRESSES.starknet.WSTETH_1,
  ADDRESSES.starknet.STRK,
  ADDRESSES.starknet.XSTRK,
  ADDRESSES.starknet.SSTRK,
  ADDRESSES.starknet.EKUBO,
  "0x498edfaf50ca5855666a700c25dd629d577eb9afccdf3b5977aec79aee55ada", // CASH
  "0x02019e47A0Bc54ea6b4853C6123FfC8158EA3AE2Af4166928b0dE6e89f06De6C" // rUSDC
];

module.exports = {
  abi,
  allAbi,
  assets,
}
