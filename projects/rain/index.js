const { Program } = require("@coral-xyz/anchor");
const { bs58 } = require('@project-serum/anchor/dist/cjs/utils/bytes');
const { getProvider } = require("../helper/solana");
const bankIdl = {
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
};
const defiIdl = {
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
};

async function tvl(api) {
  const provider = getProvider();
  const bankProgram = new Program(bankIdl, provider);
  const defiProgram = new Program(defiIdl, provider);

  // Get all banks
  const banks = [];
  
  const expectedDiscriminant = Buffer.from([142, 49, 166, 242, 50, 66, 97, 188]);
  const rawAccounts = await provider.connection.getProgramAccounts(bankProgram.programId, {
    filters: [
      {
        memcmp: {
          offset: 0,
          bytes: bs58.encode(expectedDiscriminant),
        },
      },
    ],
  });

  for (const acc of rawAccounts) {
    const data = acc.account.data;

    if (!data.slice(0, 8).equals(expectedDiscriminant)) continue;
    if (data.length < 900) continue;

    const bankTypeTag = data.readUInt8(128);
    if (bankTypeTag !== 0 && bankTypeTag !== 1) continue;

    const decoded = bankProgram.coder.accounts.decode('bank', data);
    banks.push({ publicKey: acc.pubkey, account: decoded });
  }

  // Get all active defi loans
  const defiLoans = await defiProgram.account.loan.all([
    {
      memcmp: {
        offset: 8 + 64 + 1,
        bytes: bs58.encode(Buffer.from([0])), // active loans only
      },
    },
  ]);

  // Add bank available liquidity to TVL, availableLiquidity = totalLiquidity - borrowedLiquidity
  for (const bank of banks) {
    api.add(
      bank.account.mint.toString(),
      bank.account.availableLiquidity
    );
  }

  // Add defi loan collateral to TVL
  for (const loan of defiLoans) {
    api.add(
      loan.account.collateral.toString(),
      loan.account.collateralAmount
    );
  }
}

async function borrowed(api) {
  const provider = getProvider();
  const defiProgram = new Program(defiIdl, provider);

  // Get all active defi loans
  const defiLoans = await defiProgram.account.loan.all([
    {
      memcmp: {
        offset: 8 + 64 + 1,
        bytes: bs58.encode(Buffer.from([0])), // active loans only
      },
    },
  ]);

  // Add defi loan collateral to TVL
  for (const loan of defiLoans) {
    api.add(
      loan.account.principal.toString(),
      loan.account.borrowedAmount
    );
  }
}

module.exports = {
  solana: { tvl, borrowed, },
}