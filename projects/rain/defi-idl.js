module.exports = {
  "address": "rDeFiHPjHZRLiz4iBzMw3zv6unZs4VwdU6qQcVd3NSK",
  "metadata": { "name": "defi_lending", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor" },
  "instructions": [],
  "accounts": [{ "name": "Loan", "discriminator": [20, 195, 70, 117, 165, 227, 182, 1] }],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Loan",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "kind", "type": { "defined": { "name": "LoanKind" } } },
          { "name": "status", "type": { "defined": { "name": "LoanStatus" } } },
          { "name": "is_custom", "type": "u8" },
          { "name": "_padding1", "type": { "array": ["u8", 6] } },
          { "name": "borrower", "type": "pubkey" },
          { "name": "bank", "type": "pubkey" },
          { "name": "pool", "type": "pubkey" },
          { "name": "collateral", "type": "pubkey" },
          { "name": "principal", "type": "pubkey" },
          { "name": "referrer", "type": "pubkey" },
          { "name": "interest", "type": "u64" },
          { "name": "borrowed_amount", "type": "u64" },
          { "name": "collateral_amount", "type": "u64" },
          { "name": "duration", "type": "u32" },
          { "name": "currency", "type": "u32" },
          { "name": "liquidation", "type": "u16" },
          { "name": "_padding2", "type": { "array": ["u8", 6] } },
          { "name": "created_at", "type": "u64" },
          { "name": "expired_at", "type": "u64" },
          { "name": "repaid_at", "type": "u64" },
          { "name": "liquidated_at", "type": "u64" },
          { "name": "sold_amount", "type": "u64" },
          { "name": "reserved", "type": { "array": ["u64", 9] } }
        ]
      }
    },
    {
      "name": "LoanKind",
      "type": {
        "kind": "enum",
        "variants": [
          { "name": "Classic", "fields": [{ "defined": { "name": "ClassicLoan" } }] },
          { "name": "MarginSwap", "fields": [{ "defined": { "name": "MarginSwapLoan" } }] },
          { "name": "Request", "fields": [{ "defined": { "name": "RequestLoan" } }] },
        ]
      }
    },
    { "name": "ClassicLoan", "type": { "kind": "struct", "fields": [{ "name": "reserved", "type": { "array": ["u8", 64] } }] } },
    {
      "name": "MarginSwapLoan",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "down_payment", "type": "u64" },
          { "name": "reserved", "type": { "array": ["u8", 32] } },
          { "name": "reserved1", "type": { "array": ["u8", 24] } }
        ]
      }
    },
    {
      "name": "RequestLoan",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "reserved", "type": {"array": ["u8", 64]}}
        ]
      }
    },
    { "name": "LoanStatus", "type": { "kind": "enum", "variants": [{ "name": "Ongoing" }, { "name": "Repaid" }, { "name": "Liquidated" }, { "name": "Sold" }] } }
  ]
}