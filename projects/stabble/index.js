const sdk = require("@defillama/sdk");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");
const { getProvider, sumTokens2 } = require("../helper/solana");

async function weightedSwapTvl() {
  const VAULT_ID = "w8edo9a9TDw52c1rBmVbP6dNakaAuFiPjDd52ZJwwVi";

  const provider = getProvider();
  const programId = new PublicKey("swapFpHZwjELNnjvThjajtiVmkz3yPQEHjLtka2fwHW");
  const program = new Program(WEIGHTED_SWAP_IDL, programId, provider);
  const pools = await program.account.pool.all([
    {
      memcmp: {
        offset: 8,
        bytes: VAULT_ID,
      },
    },
  ]);
  const owner = findVaultAuthorityAddress(new PublicKey(VAULT_ID));
  const tokens = new Set(
    pools.map(({ account }) => account.tokens.map((token) => token.mint).flat())
  );

  return sumTokens2({
    owner,
    tokens,
  });
}

async function stableSwapTvl() {
  const VAULT_ID = "stab1io8dHvK26KoHmTwwHyYmHRbUWbyEJx6CdrGabC";

  const provider = getProvider();
  const programId = new PublicKey("swapNyd8XiQwJ6ianp9snpu4brUqFxadzvHebnAXjJZ");
  const program = new Program(STABLE_SWAP_IDL, programId, provider);
  const pools = await program.account.pool.all([
    {
      memcmp: {
        offset: 8,
        bytes: VAULT_ID,
      },
    },
  ]);
  const owner = findVaultAuthorityAddress(new PublicKey(VAULT_ID));
  const tokens = new Set(
    pools.map(({ account }) => account.tokens.map((token) => token.mint).flat())
  );

  return sumTokens2({
    owner,
    tokens,
  });
}

module.exports = {
  timetravel: false,
  solana: { tvl: sdk.util.sumChainTvls([weightedSwapTvl, stableSwapTvl]) },
};

function findVaultAuthorityAddress(vaultKey) {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault_authority"), vaultKey.toBuffer()],
    new PublicKey("vo1tWgqZMjG61Z2T9qUaMYKqZ75CYzMuaZ2LZP1n7HV")
  )[0];
}

const WEIGHTED_SWAP_IDL = {
  version: "1.0.0",
  name: "stable_swap",
  instructions: [],
  accounts: [
    {
      name: "Pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "vault",
            type: "pubkey",
          },
          {
            name: "mint",
            type: "pubkey",
          },
          {
            name: "authority_bump",
            type: "u8",
          },
          {
            name: "is_active",
            type: "bool",
          },
          {
            name: "invariant",
            type: "u64",
          },
          {
            name: "swap_fee",
            type: "u64",
          },
          {
            name: "tokens",
            type: {
              vec: {
                defined: {
                  name: "PoolToken",
                },
              },
            },
          },
          {
            name: "pending_owner",
            type: {
              option: "pubkey",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "PoolToken",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "pubkey",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "scaling_up",
            type: "bool",
          },
          {
            name: "scaling_factor",
            type: "u64",
          },
          {
            name: "balance",
            type: "u64",
          },
          {
            name: "weight",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [],
};

const STABLE_SWAP_IDL = {
  version: "1.0.0",
  name: "stable_swap",
  instructions: [],
  accounts: [
    {
      name: "Pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "pubkey",
          },
          {
            name: "vault",
            type: "pubkey",
          },
          {
            name: "mint",
            type: "pubkey",
          },
          {
            name: "authority_bump",
            type: "u8",
          },
          {
            name: "is_active",
            type: "bool",
          },
          {
            name: "amp_initial_factor",
            type: "u16",
          },
          {
            name: "amp_target_factor",
            type: "u16",
          },
          {
            name: "ramp_start_ts",
            type: "i64",
          },
          {
            name: "ramp_stop_ts",
            type: "i64",
          },
          {
            name: "swap_fee",
            type: "u64",
          },
          {
            name: "tokens",
            type: {
              vec: {
                defined: {
                  name: "PoolToken",
                },
              },
            },
          },
          {
            name: "pending_owner",
            type: {
              option: "pubkey",
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "PoolToken",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "pubkey",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "scaling_up",
            type: "bool",
          },
          {
            name: "scaling_factor",
            type: "u64",
          },
          {
            name: "balance",
            type: "u64",
          },
        ],
      },
    },
  ],
  errors: [],
};
