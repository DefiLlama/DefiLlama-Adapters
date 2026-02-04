
const erc20ABI = [
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
  }
];

const singletonABI = [
  {
    type: "function",
    name: "asset_config_unsafe",
    inputs: [
      {
        name: "pool_id",
        type: "felt"
      },
      {
        name: "asset",
        type: "felt"
      }
    ],
    outputs: [
      {
        type: "(vesu::data_model::AssetConfig, core::integer::u256)"
      }
    ],
    state_mutability: "view",
    customInput: "address"
  },
  {
    type: "struct",
    name: "vesu::data_model::AssetConfig",
    members: [
      {
        name: "total_collateral_shares",
        type: "core::integer::u256"
      },
      {
        name: "total_nominal_debt",
        type: "core::integer::u256"
      },
      {
        name: "reserve",
        type: "core::integer::u256"
      },
      {
        name: "max_utilization",
        type: "core::integer::u256"
      },
      {
        name: "floor",
        type: "core::integer::u256"
      },
      {
        name: "scale",
        type: "core::integer::u256"
      },
      {
        name: "is_legacy",
        type: "core::bool"
      },
      {
        name: "last_updated",
        type: "core::integer::u64"
      },
      {
        name: "last_rate_accumulator",
        type: "core::integer::u256"
      },
      {
        name: "last_full_utilization_rate",
        type: "core::integer::u256"
      },
      {
        name: "fee_rate",
        type: "core::integer::u256"
      }
    ]
  }  
];

const poolABI = [
  {
    type: "function",
    name: "asset_config",
    inputs: [
      {
        name: "asset",
        type: "felt"
      }
    ],
    outputs: [
      {
        type: "vesu::data_model::AssetConfig"
      }
    ],
    state_mutability: "view",
    customInput: "address"
  },
  {
    type: "struct",
    name: "vesu::data_model::AssetConfig",
    members: [
      {
        name: "total_collateral_shares",
        type: "core::integer::u256"
      },
      {
        name: "total_nominal_debt",
        type: "core::integer::u256"
      },
      {
        name: "reserve",
        type: "core::integer::u256"
      },
      {
        name: "max_utilization",
        type: "core::integer::u256"
      },
      {
        name: "floor",
        type: "core::integer::u256"
      },
      {
        name: "scale",
        type: "core::integer::u256"
      },
      {
        name: "is_legacy",
        type: "core::bool"
      },
      {
        name: "last_updated",
        type: "core::integer::u64"
      },
      {
        name: "last_rate_accumulator",
        type: "core::integer::u256"
      },
      {
        name: "last_full_utilization_rate",
        type: "core::integer::u256"
      },
      {
        name: "fee_rate",
        type: "core::integer::u256"
      },
      {
        name: "fee_shares",
        type: "core::integer::u256"
      }
    ]
  },
]

module.exports = {
  erc20ABI,
  singletonABI,
  poolABI,
};
