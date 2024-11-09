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
        offset: 40,
        bytes: VAULT_ID,
      },
    },
  ]);
  const tokens = Array.from(new Set(pools.map(({ account }) => account.tokens.map(({ mint }) => mint)).flat()));
  const owner = findVaultAuthorityAddress(new PublicKey(VAULT_ID));

  return sumTokens2({
    tokens,
    owner,
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
        offset: 40,
        bytes: VAULT_ID,
      },
    },
  ]);
  const tokens = Array.from(new Set(pools.map(({ account }) => account.tokens.map(({ mint }) => mint)).flat()));
  const owner = findVaultAuthorityAddress(new PublicKey(VAULT_ID));

  return sumTokens2({
    tokens,
    owner,
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
  name: "weighted_swap",
  instructions: [],
  accounts: [
    {
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
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
            name: "authorityBump",
            type: "u8",
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "invariant",
            type: "u64",
          },
          {
            name: "swapFee",
            type: "u64",
          },
          {
            name: "tokens",
            type: {
              vec: {
                defined: "PoolToken",
              },
            },
          },
          {
            name: "pendingOwner",
            type: {
              option: "publicKey",
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
            type: "publicKey",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "scalingUp",
            type: "bool",
          },
          {
            name: "scalingFactor",
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
      name: "pool",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
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
            name: "authorityBump",
            type: "u8",
          },
          {
            name: "isActive",
            type: "bool",
          },
          {
            name: "ampInitialFactor",
            type: "u16",
          },
          {
            name: "ampTargetFactor",
            type: "u16",
          },
          {
            name: "rampStartTs",
            type: "i64",
          },
          {
            name: "rampStopTs",
            type: "i64",
          },
          {
            name: "swapFee",
            type: "u64",
          },
          {
            name: "tokens",
            type: {
              vec: {
                defined: "PoolToken",
              },
            },
          },
          {
            name: "pendingOwner",
            type: {
              option: "publicKey",
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
            type: "publicKey",
          },
          {
            name: "decimals",
            type: "u8",
          },
          {
            name: "scalingUp",
            type: "bool",
          },
          {
            name: "scalingFactor",
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
