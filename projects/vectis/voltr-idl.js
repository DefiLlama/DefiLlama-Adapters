module.exports ={
  "address": "vVoLTRjQmtFpiYoegx285Ze4gsLJ8ZxgFKVcuvmG1a8",
  "metadata": {"name": "voltr_vault", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [{"name": "Vault", "discriminator": [211, 8, 232, 43, 2, 152, 117, 119]}],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Vault",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "name", "docs": ["The vault's name."], "type": {"array": ["u8", 32]}},
          {"name": "description", "docs": ["A description or summary for this vault."], "type": {"array": ["u8", 64]}},
          {"name": "asset", "docs": ["The vault’s main asset configuration (inline nested struct)."], "type": {"defined": {"name": "VaultAsset"}}},
          {"name": "lp", "docs": ["The vault’s LP (share) configuration (inline nested struct)."], "type": {"defined": {"name": "VaultLp"}}},
          {"name": "manager", "docs": ["The manager of this vault (has certain permissions)."], "type": "pubkey"},
          {"name": "admin", "docs": ["The admin of this vault (broader or fallback permissions)."], "type": "pubkey"},
          {
            "name": "vault_configuration",
            "docs": ["The vault fee, cap, and locked profit degradation duration configuration (inline nested struct)."],
            "type": {"defined": {"name": "VaultConfiguration"}}
          },
          {
            "name": "fee_configuration",
            "docs": ["The vault fee and cap configuration (inline nested struct)."],
            "type": {"defined": {"name": "FeeConfiguration"}}
          },
          {"name": "fee_update", "docs": ["The fee update state of the vault."], "type": {"defined": {"name": "FeeUpdate"}}},
          {"name": "fee_state", "docs": ["The fee state of the vault."], "type": {"defined": {"name": "FeeState"}}},
          {"name": "high_water_mark", "type": {"defined": {"name": "HighWaterMark"}}},
          {"name": "last_updated_ts", "docs": ["The last time (Unix timestamp) this vault data was updated."], "type": "u64"},
          {"name": "version", "docs": ["The version of the vault."], "type": "u8"},
          {"name": "_padding0", "docs": ["padding to align future 8-byte fields on 8-byte boundaries."], "type": {"array": ["u8", 7]}},
          {"name": "locked_profit_state", "docs": ["The locked profit state of the vault."], "type": {"defined": {"name": "LockedProfitState"}}},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 240]}}
        ]
      }
    },
    {
      "name": "VaultAsset",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "mint", "docs": ["The mint for the vault’s main asset."], "type": "pubkey"},
          {"name": "idle_ata", "docs": ["The “idle” token account holding un-invested assets."], "type": "pubkey"},
          {"name": "total_value", "docs": ["The total amount of this asset currently in the vault."], "type": "u64"},
          {"name": "idle_ata_auth_bump", "docs": ["The bump for the vault asset mint."], "type": "u8"},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 95]}}
        ]
      }
    },
    {
      "name": "VaultLp",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "mint", "docs": ["The LP mint (e.g., representing shares in this vault)."], "type": "pubkey"},
          {"name": "mint_bump", "docs": ["The bump for the vault LP mint."], "type": "u8"},
          {"name": "mint_auth_bump", "docs": ["The bump for the vault LP mint authority."], "type": "u8"},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 62]}}
        ]
      }
    },
    {
      "name": "VaultConfiguration",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "max_cap", "docs": ["The maximum total amount allowed in the vault."], "type": "u64"},
          {"name": "start_at_ts", "docs": ["active from timestamp"], "type": "u64"},
          {"name": "locked_profit_degradation_duration", "docs": ["The locked profit degradation duration."], "type": "u64"},
          {"name": "withdrawal_waiting_period", "docs": ["The waiting period for a withdrawal. prec: seconds"], "type": "u64"},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 48]}}
        ]
      }
    },
    {
      "name": "FeeConfiguration",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "manager_performance_fee", "docs": ["Manager performance fee in basis points (BPS)."], "type": "u16"},
          {"name": "admin_performance_fee", "docs": ["Admin performance fee in basis points (BPS)."], "type": "u16"},
          {"name": "manager_management_fee", "docs": ["Manager management fee in basis points (BPS)."], "type": "u16"},
          {"name": "admin_management_fee", "docs": ["Admin management fee in basis points (BPS)."], "type": "u16"},
          {"name": "redemption_fee", "docs": ["The redemption fee in basis points (BPS)."], "type": "u16"},
          {"name": "issuance_fee", "docs": ["The issuance fee in basis points (BPS)."], "type": "u16"},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 36]}}
        ]
      }
    },
    {
      "name": "FeeUpdate",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "last_performance_fee_update_ts", "docs": ["The timestamp when the performance fees were last updated."], "type": "u64"},
          {"name": "last_management_fee_update_ts", "docs": ["The timestamp when the management fees were last updated."], "type": "u64"}
        ]
      }
    },
    {
      "name": "FeeState",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "accumulated_lp_manager_fees", "docs": ["The accumulated manager fees in the vault."], "type": "u64"},
          {"name": "accumulated_lp_admin_fees", "docs": ["The accumulated admin fees in the vault."], "type": "u64"},
          {"name": "accumulated_lp_protocol_fees", "docs": ["The accumulated protocol fees in the vault."], "type": "u64"},
          {"name": "reserved", "docs": ["Reserved bytes for future use."], "type": {"array": ["u8", 24]}}
        ]
      }
    },
    {
      "name": "HighWaterMark",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "highest_asset_per_lp_decimal_bits", "docs": ["The highest recorded total asset value per share"], "type": "u128"},
          {"name": "last_updated_ts", "docs": ["The timestamp when the high water mark was last updated"], "type": "u64"},
          {"name": "reserved", "docs": ["Reserved for future use"], "type": {"array": ["u8", 8]}}
        ]
      }
    },
    {
      "name": "LockedProfitState",
      "serialization": "bytemuckunsafe",
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"name": "last_updated_locked_profit", "type": "u64"}, {"name": "last_report", "type": "u64"}]}
    }
  ]
}