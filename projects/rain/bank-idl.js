module.exports = {
  "address": "rain2M5b9GeFCk792swkwUu51ZihHJb3SUQ8uHxSRJf",
  "metadata": {"name": "bank", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [
    {"name": "Bank", "discriminator": [142, 49, 166, 242, 50, 66, 97, 188]},
  ],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Bank",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "owner", "type": "pubkey"},
          {"name": "mint", "type": "pubkey"},
          {"name": "vault", "type": "pubkey"},
          {"name": "authority", "type": "pubkey"},
          {"name": "bank_type", "type": {"defined": {"name": "BankType"}}},
          {"name": "total_liquidity", "type": "u64"},
          {"name": "available_liquidity", "type": "u64"},
          {"name": "delegated_liquidity", "type": "u64"},
          {"name": "cooldown_liquidity", "type": "u64"},
          {"name": "cooldown_period", "type": "u64"},
          {"name": "delegators", "type": {"array": [{"defined": {"name": "Delegator"}}, 8]}},
          {"name": "created_at", "type": "u64"},
          {"name": "deposited_at", "type": "u64"},
          {"name": "withdrawn_at", "type": "u64"},
          {"name": "borrowed_at", "type": "u64"},
          {"name": "repaid_at", "type": "u64"},
          {"name": "frozen_until", "type": "u64"},
          {"name": "reserved", "type": {"array": ["u8", 512]}}
        ]
      }
    },
    {
      "name": "BankType",
      "type": {
        "kind": "enum",
        "variants": [
          {"name": "Personal", "fields": [{"defined": {"name": "PersonalBank"}}]},
          {"name": "Shared", "fields": [{"defined": {"name": "SharedBank"}}]}
        ]
      }
    },
    {
      "name": "PersonalBank",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "reserved", "type": {"array": ["u8", 32]}},
          {"name": "reserved1", "type": {"array": ["u8", 32]}},
          {"name": "reserved2", "type": {"array": ["u8", 16]}}
        ]
      }
    },
    {
      "name": "SharedBank",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "lp_mint", "type": "pubkey"},
          {"name": "lp_rate", "type": "u128"},
          {"name": "lp_supply", "type": "u64"},
          {"name": "_padding1", "type": {"array": ["u8", 8]}},
          {"name": "lp_decimals", "type": "u8"},
          {"name": "_padding2", "type": {"array": ["u8", 15]}}
        ]
      }
    },
    {
      "name": "Delegator",
      "type": {
        "kind": "struct",
        "fields": [{"name": "delegator_type", "type": {"defined": {"name": "DelegatorType"}}}, {"name": "delegated_amount", "type": "u64"}]
      }
    },
    {"name": "DelegatorType", "type": {"kind": "enum", "variants": [{"name": "Empty", "fields": [{"defined": {"name": "EmptyDelegator"}}]}]}},
    {
      "name": "EmptyDelegator",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "reserved", "type": {"array": ["u8", 32]}},
          {"name": "reserved1", "type": {"array": ["u8", 32]}},
          {"name": "reserved2", "type": {"array": ["u8", 32]}},
          {"name": "reserved3", "type": {"array": ["u8", 24]}}
        ]
      }
    }
  ]
}