const { getProvider, sumTokens2 } = require("../helper/solana");
const { Program } = require("@project-serum/anchor");
const { PublicKey } = require("@solana/web3.js");

async function tvl(api) {
  const provider = getProvider(api.chain);
  const programId = fusionammIDL.address;
  const program = new Program(fusionammIDL, programId, provider);
  const pools = await program.account.fusionPool.all()
  const tokenAccounts = pools
    .map(({ account }) => [account.tokenVaultA, account.tokenVaultB])
    .flat();
  return sumTokens2({ tokenAccounts, api, });
};

async function pool2(api) {
  const TUNA_MINT = new PublicKey("TUNAfXDZEdQizTMTh3uEvNvYqJmqFHZbEJt8joP4cyx");
  const provider = getProvider(api.chain);
  const programId = fusionammIDL.address;
  const program = new Program(fusionammIDL, programId, provider);
  const pools = await program.account.fusionPool.all();
  const tokenAccounts = pools
    .filter(({ account }) => (account.tokenMintA.equals(TUNA_MINT) || account.tokenMintB.equals(TUNA_MINT)))
    .map(({ account }) => [account.tokenVaultA, account.tokenVaultB])
    .flat();
  return sumTokens2({ tokenAccounts, api, });
};

module.exports = {
  timetravel: false,
  solana: { tvl, pool2 },
};

const fusionammIDL = {
  "address": "fUSioN9YKKSa3CUC2YUc4tPkHJ5Y6XW1yz8y6F7qWz9",
  "metadata": {
    "name": "fusionamm",
    "version": "1.0.10",
    "spec": "0.1.0"
  },
  "instructions": [],
  "accounts": [
    {
      "name": "FusionPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": {
              "array": [
                "u8",
                1
              ]
            }
          },
          {
            "name": "version",
            "type": "u16"
          },
          {
            "name": "token_mint_a",
            "type": "publicKey"
          },
          {
            "name": "token_mint_b",
            "type": "publicKey"
          },
          {
            "name": "token_vault_a",
            "type": "publicKey"
          },
          {
            "name": "token_vault_b",
            "type": "publicKey"
          },
          {
            "name": "tick_spacing",
            "type": "u16"
          },
          {
            "name": "tick_spacing_seed",
            "type": {
              "array": [
                "u8",
                2
              ]
            }
          },
          {
            "name": "fee_rate",
            "type": "u16"
          },
          {
            "name": "protocol_fee_rate",
            "type": "u16"
          },
          {
            "name": "clp_reward_rate",
            "type": "u16"
          },
          {
            "name": "order_protocol_fee_rate",
            "type": "u16"
          },
          {
            "name": "liquidity",
            "type": "u128"
          },
          {
            "name": "sqrt_price",
            "type": "u128"
          },
          {
            "name": "tick_current_index",
            "type": "i32"
          },
          {
            "name": "protocol_fee_owed_a",
            "type": "u64"
          },
          {
            "name": "protocol_fee_owed_b",
            "type": "u64"
          },
          {
            "name": "fee_growth_global_a",
            "type": "u128"
          },
          {
            "name": "fee_growth_global_b",
            "type": "u128"
          },
          {
            "name": "orders_total_amount_a",
            "type": "u64"
          },
          {
            "name": "orders_total_amount_b",
            "type": "u64"
          },
          {
            "name": "orders_filled_amount_a",
            "type": "u64"
          },
          {
            "name": "orders_filled_amount_b",
            "type": "u64"
          },
          {
            "name": "olp_fee_owed_a",
            "type": "u64"
          },
          {
            "name": "olp_fee_owed_b",
            "type": "u64"
          },
          {
            "name": "reserved",
            "type": {
              "array": [
                "u8",
                140
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [],
  "types": []
}