const SplTokenStakingIDLV0 = {
  version: "0.1.5",
  name: "spl_token_staking",
  instructions: [],
  accounts: [
    {
      name: "stakePool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "authority",
            type: "publicKey",
          },
          {
            name: "totalWeightedStake",
            type: "u128",
          },
          {
            name: "vault",
            type: "publicKey",
          },
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "stakeMint",
            type: "publicKey",
          },
          {
            name: "rewardPools",
            type: {
              array: [
                {
                  defined: "RewardPool",
                },
                10,
              ],
            },
          },
          {
            name: "baseWeight",
            type: "u64",
          },
          {
            name: "maxWeight",
            type: "u64",
          },
          {
            name: "minDuration",
            type: "u64",
          },
          {
            name: "maxDuration",
            type: "u64",
          },
          {
            name: "nonce",
            type: "u8",
          },
          {
            name: "bumpSeed", type: "u8",
          },
          {
            name: "padding0",
            type: {
              array: ["u8", 6],
            },
          },
          {
            name: "reserved0",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "RewardPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardVault", type: "publicKey",
          },
          {
            name: "rewardsPerEffectiveStake",
            type: "u128",
          },
          {
            name: "lastAmount", type: "u64",
          },
          {
            name: "padding0",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
  ],
  errors: [],
};

const SplTokenStakingIDLV1 = {
  version: "1.1.2",
  name: "spl_token_staking",
  instructions: [],
  accounts: [
    {
      name: "stakePool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "creator",
            type: "publicKey",
          },
          {
            name: "authority", type: "publicKey",
          },
          {
            name: "totalWeightedStake",
            type: "u128",
          },
          {
            name: "vault", type: "publicKey",
          },
          {
            name: "mint", type: "publicKey",
          },
          {
            name: "stakeMint", type: "publicKey",
          },
          {
            name: "rewardPools",
            type: {
              array: [
                {
                  defined: "RewardPool",
                },
                10,
              ],
            },
          },
          {
            name: "baseWeight",
            type: "u64",
          },
          {
            name: "maxWeight",
            type: "u64",
          },
          {
            name: "minDuration",
            type: "u64",
          },
          {
            name: "maxDuration",
            type: "u64",
          },
          {
            name: "nonce", type: "u8",
          },
          {
            name: "bumpSeed", type: "u8",
          },
          {
            name: "padding0",
            type: {
              array: ["u8", 6],
            },
          },
          {
            name: "reserved0",
            type: {
              array: ["u8", 256],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "RewardPool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "rewardVault", type: "publicKey",
          },
          {
            name: "rewardsPerEffectiveStake",
            type: "u128",
          },
          {
            name: "lastAmount", type: "u64",
          },
          {
            name: "padding0",
            type: {
              array: ["u8", 8],
            },
          },
        ],
      },
    },
  ],
  errors: [],
};

module.exports = {
  SplTokenStakingIDLV0,
  SplTokenStakingIDLV1,
};
