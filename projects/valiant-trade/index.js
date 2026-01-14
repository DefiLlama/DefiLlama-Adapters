const { sumTokens2, getProvider, } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const DEX_PROGRAM_ID = 'vnt1u7PzorND5JjweFWmDawKe2hLWoTwHU6QKz6XX98'


async function tvl(api) {
  const provider = getProvider(api.chain);
  const program = new Program(idl, DEX_PROGRAM_ID, provider)

  const tokenAccounts = (await program.account.vortex.all())
    .map(({ account }) => [account.tokenVaultA, account.tokenVaultB])
    .flat();

  return sumTokens2({ tokenAccounts, api });
}

module.exports = {
  timetravel: false,
  fogo: {
    tvl,
  }
}

const idl = {
  "version": "0.3.4",
  "name": "vortex",
  "instructions": [],
  "accounts": [
    {
      "name": "Vortex",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "vortexConfig", "type": "publicKey" },
          { "name": "vortexBump", "type": { "array": ["u8", 1] } },
          { "name": "tickSpacing", "type": "u16" },
          { "name": "tickSpacingSeed", "type": { "array": ["u8", 2] } },
          { "name": "feeRate", "type": "u16" },
          { "name": "protocolFeeRate", "type": "u16" },
          { "name": "liquidity", "type": "u128" },
          { "name": "sqrtPrice", "type": "u128" },
          { "name": "tickCurrentIndex", "type": "i32" },
          { "name": "protocolFeeOwedA", "type": "u64" },
          { "name": "protocolFeeOwedB", "type": "u64" },
          { "name": "tokenMintA", "type": "publicKey" },
          { "name": "tokenVaultA", "type": "publicKey" },
          { "name": "feeGrowthGlobalA", "type": "u128" },
          { "name": "tokenMintB", "type": "publicKey" },
          { "name": "tokenVaultB", "type": "publicKey" },
          { "name": "feeGrowthGlobalB", "type": "u128" },
          { "name": "rewardLastUpdatedTimestamp", "type": "u64" },
          { "name": "rewardInfos", "type": { "array": [{ "defined": "VortexRewardInfo" }, 3] } }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "VortexRewardInfo",
      "docs": [
        "Stores the state relevant for tracking liquidity mining rewards at the `Vortex` level.",
        "These values are used in conjunction with `PositionRewardInfo`, `Tick.reward_growths_outside`,",
        "and `Vortex.reward_last_updated_timestamp` to determine how many rewards are earned by open",
        "positions."
      ],
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "mint", "docs": ["Reward token mint."], "type": "publicKey" },
          { "name": "vault", "docs": ["Reward vault token account."], "type": "publicKey" },
          { "name": "authority", "docs": ["Authority account that has permission to initialize the reward and set emissions."], "type": "publicKey" },
          { "name": "emissionsPerSecondX64", "docs": ["Q64.64 number that indicates how many tokens per second are earned."], "type": "u128" },
          {
            "name": "growthGlobalX64",
            "docs": ["Q64.64 number that tracks the total tokens earned per unit of liquidity since the reward", "emissions were turned on."],
            "type": "u128"
          }
        ]
      }
    }
  ],
  "events": [],
  "errors": []
}