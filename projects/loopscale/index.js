const { PublicKey } = require('@solana/web3.js')
const { Program, AnchorProvider, BN } = require("@coral-xyz/anchor");
const { getConnection, } = require('../helper/solana');
const loopscaleIdl = {
  "address": "1oopBoJG58DgkUVKkEzKgyG9dvRmpgeEm1AVjoHkF78",
  "metadata": {"name": "loopscale", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [
    {"name": "Loan", "discriminator": [20, 195, 70, 117, 165, 227, 182, 1]},
    {"name": "Strategy", "discriminator": [174, 110, 39, 119, 82, 106, 169, 102]}
  ],
  "events": [],
  "errors": [],
  "types": [
    {
      "name": "Loan",
      "serialization": "bytemuck",
      "repr": {"kind": "c", "packed": true},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "version", "type": "u8"},
          {"name": "bump", "type": "u8"},
          {"name": "loan_status", "type": "u8"},
          {"name": "borrower", "type": "pubkey"},
          {"name": "nonce", "type": "u64"},
          {"name": "start_time", "type": {"defined": {"name": "PodU64"}}},
          {"name": "ledgers", "type": {"array": [{"defined": {"name": "Ledger"}}, 5]}},
          {"name": "collateral", "type": {"array": [{"defined": {"name": "CollateralData"}}, 5]}}
        ]
      }
    },
    {
      "name": "PodU64",
      "docs": ["Represents a 64-bit unsigned integer stored as bytes (little-endian)"],
      "repr": {"kind": "transparent"},
      "type": {"kind": "struct", "fields": [{"array": ["u8", 8]}]}
    },
    {
      "name": "Ledger",
      "serialization": "bytemuck",
      "repr": {"kind": "c", "packed": true},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "status", "type": "u8"},
          {"name": "strategy", "type": "pubkey"},
          {"name": "principal_mint", "type": "pubkey"},
          {"name": "market_information", "type": "pubkey"},
          {"name": "principal_due", "type": {"defined": {"name": "PodU64"}}},
          {"name": "principal_repaid", "type": {"defined": {"name": "PodU64"}}},
          {"name": "interest_due", "type": {"defined": {"name": "PodU64"}}},
          {"name": "interest_repaid", "type": {"defined": {"name": "PodU64"}}},
          {"name": "duration", "type": {"defined": {"name": "Duration"}}},
          {"name": "interest_per_second", "type": {"defined": {"name": "PodDecimal"}}},
          {"name": "start_time", "type": {"defined": {"name": "PodU64"}}},
          {"name": "end_time", "type": {"defined": {"name": "PodU64"}}},
          {"name": "apy", "type": {"defined": {"name": "PodU64CBPS"}}}
        ]
      }
    },
    {
      "name": "Duration",
      "serialization": "bytemuck",
      "repr": {"kind": "c", "packed": true},
      "type": {"kind": "struct", "fields": [{"name": "duration", "type": {"defined": {"name": "PodU32"}}}, {"name": "duration_type", "type": "u8"}]}
    },
    {
      "name": "PodU32",
      "docs": ["Represents a 32-bit unsigned integer stored as bytes (little-endian)"],
      "repr": {"kind": "transparent"},
      "type": {"kind": "struct", "fields": [{"array": ["u8", 4]}]}
    },
    {
      "name": "PodDecimal",
      "docs": [
        "this is the scaled representation of a whole number. The whole number is scaled by 10^18 to avoid floating point errors when performing arithmetic operations."
      ],
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"array": ["u8", 24]}]}
    },
    {
      "name": "PodU64CBPS",
      "docs": ["helper type to store u64 cbps values"],
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"array": ["u8", 8]}]}
    },
    {
      "name": "CollateralData",
      "serialization": "bytemuck",
      "repr": {"kind": "c", "packed": true},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "asset_mint", "type": "pubkey"},
          {"name": "amount", "type": {"defined": {"name": "PodU64"}}},
          {"name": "asset_type", "type": "u8"},
          {"name": "asset_identifier", "type": "pubkey"}
        ]
      }
    },
    {
      "name": "Strategy",
      "serialization": "bytemuck",
      "repr": {"kind": "c", "packed": true},
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "version", "type": "u8"},
          {"name": "nonce", "type": "pubkey"},
          {"name": "bump", "type": "u8"},
          {"name": "principal_mint", "type": "pubkey"},
          {"name": "lender", "type": "pubkey"},
          {"name": "originations_enabled", "type": {"defined": {"name": "PodBool"}}},
          {"name": "external_yield_source", "type": "u8"},
          {"name": "interest_per_second", "type": {"defined": {"name": "PodDecimal"}}},
          {
            "name": "last_accrued_timestamp",
            "docs": ["timestamp interest per second's interest was last accrued"],
            "type": {"defined": {"name": "PodU64"}}
          },
          {
            "name": "liquidity_buffer",
            "docs": ["the is the amount of liquidity % that always needs to be in the strategy"],
            "type": {"defined": {"name": "PodU64CBPS"}}
          },
          {"name": "token_balance", "docs": ["amount of principal in the strategy"], "type": {"defined": {"name": "PodU64"}}},
          {
            "name": "interest_fee",
            "docs": ["this is the fee charged by and accrued to the manager on the interest accrued via external yield and loans"],
            "type": {"defined": {"name": "PodU64CBPS"}}
          },
          {
            "name": "principal_fee",
            "docs": ["this is the fee charged by and accrued to the manager on the origination fee"],
            "type": {"defined": {"name": "PodU64CBPS"}}
          },
          {"name": "origination_fee", "docs": ["fee charged on origination of new loans"], "type": {"defined": {"name": "PodU64CBPS"}}},
          {"name": "origination_cap", "docs": ["the maximum size of a loan that can be originated"], "type": {"defined": {"name": "PodU64"}}},
          {
            "name": "external_yield_amount",
            "docs": ["this is the amount of principal currently in external yield. has to always be updated on any new nav action"],
            "type": {"defined": {"name": "PodU64"}}
          },
          {
            "name": "current_deployed_amount",
            "docs": ["this is the amount of principal currently deployed in loans"],
            "type": {"defined": {"name": "PodU64"}}
          },
          {
            "name": "outstanding_interest_amount",
            "docs": ["this is the interest that has not been repaid yet but accrued"],
            "type": {"defined": {"name": "PodU64"}}
          },
          {"name": "fee_claimable", "docs": ["this is the amount that has accrued to the manager"], "type": {"defined": {"name": "PodU64"}}},
          {"name": "cumulative_principal_originated", "type": {"defined": {"name": "PodU128"}}},
          {"name": "cumulative_interest_accrued", "type": {"defined": {"name": "PodU128"}}},
          {"name": "cumulative_loan_count", "type": {"defined": {"name": "PodU64"}}},
          {"name": "active_loan_count", "type": {"defined": {"name": "PodU64"}}},
          {"name": "market_information", "type": "pubkey"},
          {"name": "collateral_map", "type": {"array": [{"array": [{"defined": {"name": "PodU64"}}, 5]}, 200]}},
          {"name": "external_yield_accounts", "type": {"defined": {"name": "ExternalYieldAccounts"}}}
        ]
      }
    },
    {"name": "PodBool", "docs": ["Represents a bool stored as a byte"], "repr": {"kind": "transparent"}, "type": {"kind": "struct", "fields": ["u8"]}},
    {
      "name": "PodU128",
      "docs": ["Represents a 128-bit unsigned integer stored as bytes (little-endian)"],
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"array": ["u8", 16]}]}
    },
    {
      "name": "ExternalYieldAccounts",
      "repr": {"kind": "c", "packed": true},
      "type": {"kind": "struct", "fields": [{"name": "external_yield_account", "type": "pubkey"}, {"name": "external_yield_vault", "type": "pubkey"}]}
    }
  ]
}

const endpoint = 'https://loopscale-pricing-adapters-109615290061.europe-west2.run.app/decompile_mints'

const creditbookProgram = (connection) => {
    const provider = new AnchorProvider(
        connection,
        { publicKey: PublicKey.default, signTransaction: (tx) => Promise.resolve(tx), signAllTransactions: (txs) => Promise.resolve(txs) },
        AnchorProvider.defaultOptions()
    );
    const program = new Program(loopscaleIdl, provider);
    return program;
};

async function getLoans(connection) {
  const loansBorrowed = await creditbookProgram(connection).account.loan.all();
  return loansBorrowed;
}

function bytesToNumberLE(bytes) {
    let result = 0n; // Start with BigInt 0
    for (let i = bytes.length - 1; i >= 0; i--) {
        result = (result << 8n) | BigInt(bytes[i]);

	}

    return Number(result);
}

function getCollateralValuesForLoans(loans) {
  const mintBalances = {};
  for(let i = 0; i < loans.length; i++) {
    const collateralData = loans[i].account.collateral[0];
    const collateralMint = collateralData.assetMint;
    const totalCollateral = new BN(collateralData.amount[0].reverse()).toNumber();

    mintBalances[collateralMint] = mintBalances[collateralMint] ? mintBalances[collateralMint] + totalCollateral : totalCollateral;
  }
  return mintBalances;
}

function getOutstandingBalanceForStrategy(strategy, currentTimestamp) {
    // current_deployed_amount
    // plus
    // interest_outstanding
    // plus
    // interest_per_second
    // times
    // (current_timestamp - last_accrued_timestamp)
    const lastAccruedTimestamp = bytesToNumberLE(new Uint8Array(strategy.lastAccruedTimestamp[0]));
    const interestPerSecond = bytesToNumberLE(new Uint8Array(strategy.interestPerSecond[0])) / 1e18;
    const currentDeployedAmount = bytesToNumberLE(new Uint8Array(strategy.currentDeployedAmount[0]));
    const outstandingInterestAmount = bytesToNumberLE(new Uint8Array(strategy.outstandingInterestAmount[0]));
    const unaccruedInterest = interestPerSecond * (currentTimestamp - lastAccruedTimestamp);

    return currentDeployedAmount + outstandingInterestAmount + unaccruedInterest;
}

function getOutstandingDebt(strategies) {
    const strategyBalances = {};
    const currentTimestamp = Math.floor(Date.now() / 1000);

    for(let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i].account;
        const mint = strategy.principalMint.toString();
        const outstandingBalance = getOutstandingBalanceForStrategy(strategy, currentTimestamp);
        strategyBalances[mint] = strategyBalances[mint] ? strategyBalances[mint] + outstandingBalance : outstandingBalance;
    }

    return strategyBalances;
}

function getIdleCapital(strategies) {
    const strategyBalances = {};

    for(let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i].account;
        const mint = strategy.principalMint.toString();
        const unusedBalance = getIdleBalanceForStrategy(strategy);
        strategyBalances[mint] = strategyBalances[mint] ? strategyBalances[mint] + unusedBalance : unusedBalance;
    }

    return strategyBalances;
}

async function getStrategies(connection) {
    const outstandingStrategies = await creditbookProgram(connection).account.strategy.all();
    
    return outstandingStrategies;
}

function getIdleBalanceForStrategy(strategy) {
    const amountExternallySupplied = bytesToNumberLE(new Uint8Array(strategy.externalYieldAmount[0]));
    const amountHeldByStrategy = bytesToNumberLE(new Uint8Array(strategy.tokenBalance[0]));

    return amountExternallySupplied + amountHeldByStrategy;
}

async function getDeposits(connection) {
    const loans = await getLoans(connection);
    const collateralBalances = getCollateralValuesForLoans(loans);

    const strats = await getStrategies(connection);
    const idleCapitalBalances = getIdleCapital(strats);

    let rawDeposits = {};

    for (const obj of [collateralBalances, idleCapitalBalances]) {
      for (const [key, value] of Object.entries(obj)) {
        rawDeposits[key] = (rawDeposits[key] || 0) + value;
      }
    }

    rawDeposits = Object.fromEntries(
        Object.entries(rawDeposits).filter(([key, value]) => value !== 0)
    );
    
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            rawBalances: rawDeposits
        })
    });

    const formattedDeposits = await response.json();

    return formattedDeposits;
}

async function tvl(api) {
  const connection = getConnection();
  const balances = await getDeposits(connection);
  const data = Object.entries(balances).map(([mint, balance]) => ({ mint, balance }));
  api.addTokens(data.map(d => d.mint), data.map(d => d.balance));
}

async function borrowed(api) {
  const connection = getConnection();
  const strategies = await getStrategies(connection);
  const outstandingDebt = getOutstandingDebt(strategies);
  const data = Object.entries(outstandingDebt).map(([mint, balance]) => ({ mint, balance }));
  api.addTokens(data.map(d => d.mint), data.map(d => d.balance));
}

module.exports = {
	doublecounted: false,
	timetravel: false,
	methodology:
		'TVL is calculated by summing up lending deposits and supplied collateral. Borrowed tokens are included.',
	solana: { tvl, borrowed, },
}
