const { PublicKey } = require('@solana/web3.js')
const { Program, AnchorProvider, BN } = require("@coral-xyz/anchor");
const { getConnection, getMultipleAccounts } = require('../helper/solana')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')
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

const WHIRLPOOL_PROGRAM = new PublicKey('whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc')
const WHIRLPOOL_POSITION_SIZE = 216
const WHIRLPOOL_SIZE = 653

function whirlpoolAccountData(account, size, key) {
  if (account.data.length !== size) throw new Error(`loopscale: whirlpool account ${key} is ${account.data.length} bytes, expected ${size}`)
  return account.data
}

// Orca position NFTs posted as collateral are valued from their liquidity at the pool's current tick
async function addWhirlpoolPositions(api, balances) {
  const nftMints = Object.keys(balances).filter(mint => balances[mint] === 1n)
  const positionKeys = nftMints.map(mint => PublicKey.findProgramAddressSync([Buffer.from('position'), new PublicKey(mint).toBuffer()], WHIRLPOOL_PROGRAM)[0])
  const positionAccounts = await getMultipleAccounts(positionKeys)
  if (positionAccounts.length !== nftMints.length) throw new Error('loopscale: position account count mismatch')

  const positions = []
  positionAccounts.forEach((account, i) => {
    if (!account || !account.owner.equals(WHIRLPOOL_PROGRAM)) return
    const data = whirlpoolAccountData(account, WHIRLPOOL_POSITION_SIZE, positionKeys[i].toString())
    if (new PublicKey(data.subarray(40, 72)).toString() !== nftMints[i]) throw new Error(`loopscale: position ${positionKeys[i]} does not belong to mint ${nftMints[i]}`)
    positions.push({
      mint: nftMints[i],
      whirlpool: new PublicKey(data.subarray(8, 40)).toString(),
      liquidity: data.readBigUInt64LE(72) + (data.readBigUInt64LE(80) << 64n),
      tickLower: data.readInt32LE(88),
      tickUpper: data.readInt32LE(92),
    })
  })

  const whirlpoolKeys = [...new Set(positions.map(p => p.whirlpool))]
  const whirlpoolAccounts = await getMultipleAccounts(whirlpoolKeys)
  const whirlpools = {}
  whirlpoolAccounts.forEach((account, i) => {
    if (!account || !account.owner.equals(WHIRLPOOL_PROGRAM)) throw new Error(`loopscale: whirlpool ${whirlpoolKeys[i]} not found`)
    const data = whirlpoolAccountData(account, WHIRLPOOL_SIZE, whirlpoolKeys[i])
    whirlpools[whirlpoolKeys[i]] = {
      tick: data.readInt32LE(81),
      tokenA: new PublicKey(data.subarray(101, 133)).toString(),
      tokenB: new PublicKey(data.subarray(181, 213)).toString(),
    }
  })

  for (const p of positions) {
    const w = whirlpools[p.whirlpool]
    addUniV3LikePosition({ api, token0: w.tokenA, token1: w.tokenB, liquidity: Number(p.liquidity), tickLower: p.tickLower, tickUpper: p.tickUpper, tick: w.tick })
  }
  return positions.map(p => p.mint)
}

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

function bytesToBigIntLE(bytes) {
    let result = 0n; // Start with BigInt 0
    for (let i = bytes.length - 1; i >= 0; i--) {
      result = (result << 8n) | BigInt(bytes[i]);
    }
    return result;
}

function getCollateralValuesForLoans(loans) {
  const mintBalances = {};
  for(let i = 0; i < loans.length; i++) {
    const collateralData = loans[i].account.collateral;
    for (let i = 0; i < collateralData.length; i++) {
      const collateralMint = collateralData[i].assetMint;
      const totalCollateral = BigInt(new BN(collateralData[i].amount[0].reverse()));
      if (collateralMint !== PublicKey.default.toString()) {
        mintBalances[collateralMint] = mintBalances[collateralMint] ? mintBalances[collateralMint] + totalCollateral : totalCollateral;
      }
    }
  }
  return mintBalances;
}

// interest accrued since last_accrued_timestamp is not extrapolated: a corrupt interest_per_second
// on one strategy (6tv6XYnX..., ~70M USDC/s) inflated borrowed to trillions
function getOutstandingBalanceForStrategy(strategy) {
    const currentDeployedAmount = bytesToBigIntLE(new Uint8Array(strategy.currentDeployedAmount[0]));
    const outstandingInterestAmount = bytesToBigIntLE(new Uint8Array(strategy.outstandingInterestAmount[0]));

    return currentDeployedAmount + outstandingInterestAmount;
}

function getOutstandingDebt(strategies) {
    const strategyBalances = {};

    for(let i = 0; i < strategies.length; i++) {
        const strategy = strategies[i].account;
        const mint = strategy.principalMint.toString();
        const outstandingBalance = getOutstandingBalanceForStrategy(strategy);
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
    const amountExternallySupplied = bytesToBigIntLE(new Uint8Array(strategy.externalYieldAmount[0]));
    const amountHeldByStrategy = bytesToBigIntLE(new Uint8Array(strategy.tokenBalance[0]));

    return amountExternallySupplied + amountHeldByStrategy;
}

async function getDeposits(connection) {
    const loans = await getLoans(connection);
    const collateralBalances = getCollateralValuesForLoans(loans);

    const strats = await getStrategies(connection);
    const idleCapitalBalances = getIdleCapital(strats);

    const rawDeposits = {};

    for (const obj of [collateralBalances, idleCapitalBalances]) {
      for (const [key, value] of Object.entries(obj)) {
        rawDeposits[key] = (rawDeposits[key] || 0n) + value;
      }
    }

    return rawDeposits;
}

async function tvl(api) {
  const balances = await getDeposits(getConnection())
  for (const mint of await addWhirlpoolPositions(api, balances)) delete balances[mint]
  const mints = Object.keys(balances).filter(mint => balances[mint] !== 0n)
  api.addTokens(mints, mints.map(mint => balances[mint]))
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
		'TVL sums idle lender capital in strategies and collateral supplied to loans, read on-chain. Orca position NFTs are valued from their pool liquidity. Collateral with no on-chain value, such as DAWN private-credit deal NFTs, is not counted.',
	solana: { tvl, borrowed, },
}
