const ADDRESSES = require('../helper/coreAssets.json')
const { getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");
const idl = {
  "address": "sVau1tXvayVWfotzm9Ahcv2qfnnfRWttt78BCnNC6dD",
  "metadata": {"name": "exponent_vaults", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [
    {"name": "ExponentStrategyVault", "discriminator": [98, 228, 39, 201, 116, 210, 39, 11]}
  ],
  "types": [
    {
      "name": "ExponentStrategyVault",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "nav_aum_circuit_breaker_state", "type": {"array": ["u8", 32]}},
          {"name": "squads_settings", "type": "pubkey"},
          {"name": "squads_vault", "type": "pubkey"},
          {"name": "token_entries", "type": {"vec": {"defined": {"name": "TokenEntry"}}}},
          {"name": "underlying_mint", "type": "pubkey"},
          {"name": "mint_lp", "type": "pubkey"},
          {"name": "token_lp_escrow", "type": "pubkey"},
          {"name": "normal_withdrawal_cut_bp", "type": "u16"},
          {"name": "fee_treasury", "type": "pubkey"},
          {"name": "self_address", "type": "pubkey"},
          {"name": "signer_bump", "type": {"array": ["u8", 1]}},
          {"name": "status_flags", "type": "u8"},
          {"name": "financials", "type": {"defined": {"name": "VaultFinancials"}}}
        ]
      }
    },
    {
      "name": "PriceId",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Simple",
            "fields": [
              {"name": "price_id", "type": "u64"}
            ]
          },
          {
            "name": "Multiply",
            "fields": [
              {"name": "price_ids", "type": {"vec": "u64"}}
            ]
          }
        ]
      }
    },
    {
      "name": "TokenEntry",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "mint", "type": "pubkey"},
          {"name": "price_id", "type": {"defined": {"name": "PriceId"}}},
          {"name": "token_squads_account", "type": "pubkey"},
          {"name": "token_account_vault", "type": "pubkey"},
          {"name": "last_observed_amount", "type": "u64"},
          {"name": "force_deallocate_policy_ids", "type": {"vec": "u64"}}
        ]
      }
    },
    {
      "name": "VaultFinancials",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "lp_balance", "type": "u64"},
          {"name": "aum_in_base", "type": "u64"},
          {"name": "aum_in_base_in_positions", "type": "u64"}
        ]
      }
    }
  ]
};

const SYNTHETIC_MINT_MAP = {
  'USD1111111111111111111111111111111111111111': ADDRESSES.solana.USDC, // synthetic USD -> USDC
  'USD1111111111111111111111111111111111111119': 'DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT', // synthetic USD9 -> USDe
}

async function tvl(api) {
  const program = new Program(idl, getProvider())
  const vaults = await program.account.exponentStrategyVault.all()
  for (const { account } of vaults) {
    // skip non-active vaults that aren't shown on the UI
    if (account.statusFlags === 8) continue
    const total = BigInt(account.financials.aumInBase.toString()) + BigInt(account.financials.aumInBaseInPositions.toString())
    if (total <= 0n) continue
    const mint = account.underlyingMint.toBase58()
    api.add(SYNTHETIC_MINT_MAP[mint] || mint, total)
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'Sum of each strategy vault\'s on-chain `aumInBase` (idle reserves) and `aumInBaseInPositions` (value of deployed positions).',
  solana: { tvl },
};
