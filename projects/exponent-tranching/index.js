const { AddressLookupTableAccount, PublicKey } = require("@solana/web3.js");
const { getConnection, getProvider } = require("../helper/solana");
const { Program } = require("@coral-xyz/anchor");

const idl = {
  "address": "XPTrnchoawiUc9iYJrpfchS8vgr8Y5X2QGBdHPXukty",
  "metadata": {"name": "exponent_tranching", "version": "0.1.0", "spec": "0.1.0", "description": "Created with Anchor"},
  "instructions": [],
  "accounts": [
    {"name": "ExponentTranchingMarket", "discriminator": [119, 38, 120, 122, 60, 24, 58, 160]}
  ],
  "types": [
    {
      "name": "CpiAccounts",
      "docs": ["Account lists for validating CPI calls to the SY program"],
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "get_sy_state", "docs": ["Fetch SY state"], "type": {"vec": {"defined": {"name": "CpiInterfaceContext"}}}},
          {"name": "deposit_sy", "docs": ["Deposit SY into personal account owned by market"], "type": {"vec": {"defined": {"name": "CpiInterfaceContext"}}}},
          {"name": "withdraw_sy", "docs": ["Withdraw SY from personal account owned by market"], "type": {"vec": {"defined": {"name": "CpiInterfaceContext"}}}},
          {"name": "claim_emission", "docs": ["Settle rewards for market-owned accounts"], "type": {"vec": {"vec": {"defined": {"name": "CpiInterfaceContext"}}}}},
          {"name": "get_position_state", "docs": ["Get personal yield position"], "type": {"vec": {"defined": {"name": "CpiInterfaceContext"}}}}
        ]
      }
    },
    {
      "name": "CpiInterfaceContext",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "alt_index", "docs": ["Address-lookup-table index"], "type": "u8"},
          {"name": "is_signer", "type": "bool"},
          {"name": "is_writable", "type": "bool"}
        ]
      }
    },
    {
      "name": "ExponentTranchingMarket",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "address_lookup_table", "docs": ["Address to ALT"], "type": "pubkey"},
          {"name": "sy_mint", "docs": ["Standardized yield token mint"], "type": "pubkey"},
          {"name": "sy_program", "docs": ["Linked SY program id"], "type": "pubkey"},
          {"name": "token_sy_escrow", "docs": ["Escrow token account that holds SY owned by the market"], "type": "pubkey"},
          {"name": "mint_lp_senior", "docs": ["Senior LP mint"], "type": "pubkey"},
          {"name": "mint_lp_junior", "docs": ["Junior LP mint"], "type": "pubkey"},
          {"name": "self_address", "docs": ["Authority PDA for CPI calls owned by the market state"], "type": "pubkey"},
          {"name": "return_model_storage", "docs": ["PDA account that stores the active return allocation model."], "type": "pubkey"},
          {"name": "signer_bump", "docs": ["PDA signer bump"], "type": {"array": ["u8", 1]}},
          {"name": "return_model_storage_bump", "docs": ["Return model storage PDA bump"], "type": {"array": ["u8", 1]}},
          {"name": "seed_id", "docs": ["Unique seed id for the market"], "type": {"array": ["u8", 8]}},
          {"name": "status_flags", "docs": ["Global status flags"], "type": "u8"},
          {"name": "market_state", "docs": ["Current market lifecycle state"], "type": {"defined": {"name": "TranchingMarketState"}}},
          {"name": "financials", "docs": ["Core financial state"], "type": {"defined": {"name": "TranchingMarketFinancials"}}},
          {"name": "tranche_supply_state", "docs": ["Tranche LP supply and escrow state"], "type": {"defined": {"name": "TrancheSupplyState"}}},
          {"name": "tranche_asset_state", "docs": ["Tranche-owned SY balances"], "type": {"defined": {"name": "TrancheAssetState"}}},
          {"name": "risk_config", "docs": ["Risk parameters"], "type": {"defined": {"name": "TranchingRiskConfig"}}},
          {"name": "protocol_fee_config", "docs": ["Protocol fee configuration"], "type": {"defined": {"name": "TranchingProtocolFeeConfig"}}},
          {"name": "reserved_padding", "docs": ["Reserved bytes at the former in-market return model slot."], "type": {"array": ["u8", 137]}},
          {"name": "roles", "docs": ["Role memberships for market control"], "type": {"defined": {"name": "TranchingMarketRoles"}}},
          {"name": "sy_cpi_accounts", "docs": ["Record of CPI accounts for the linked SY program"], "type": {"defined": {"name": "CpiAccounts"}}}
        ]
      }
    },
    {
      "name": "Number",
      "docs": ["High precision number, stored as 4 u64 words in little endian"],
      "repr": {"kind": "c"},
      "type": {"kind": "struct", "fields": [{"array": ["u64", 4]}]}
    },
    {
      "name": "TrancheAssetState",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "senior_sy_amount", "docs": ["SY balance owned by the senior tranche"], "type": "u64"},
          {"name": "junior_sy_amount", "docs": ["SY balance owned by the junior tranche"], "type": "u64"}
        ]
      }
    },
    {
      "name": "TrancheSupplyState",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "total_senior_lp_supply", "docs": ["Total senior LP supply"], "type": "u64"},
          {"name": "total_junior_lp_supply", "docs": ["Total junior LP supply"], "type": "u64"},
          {"name": "max_senior_lp_supply", "docs": ["Optional max senior LP supply"], "type": "u64"},
          {"name": "max_junior_lp_supply", "docs": ["Optional max junior LP supply"], "type": "u64"},
          {"name": "pending_senior_protocol_fee_lp_shares", "docs": ["Protocol fee senior LP shares accrued but not minted yet"], "type": "u64"},
          {"name": "pending_junior_protocol_fee_lp_shares", "docs": ["Protocol fee junior LP shares accrued but not minted yet"], "type": "u64"},
          {"name": "pending_senior_deposit_protocol_fee_lp_shares", "docs": ["Senior deposit protocol fee LP shares accrued but not minted yet"], "type": "u64"},
          {"name": "pending_junior_deposit_protocol_fee_lp_shares", "docs": ["Junior deposit protocol fee LP shares accrued but not minted yet"], "type": "u64"},
          {"name": "pending_senior_withdraw_protocol_fee_lp_shares", "docs": ["Senior withdrawal protocol fee LP shares accrued but not minted yet"], "type": "u64"},
          {"name": "pending_junior_withdraw_protocol_fee_lp_shares", "docs": ["Junior withdrawal protocol fee LP shares accrued but not minted yet"], "type": "u64"}
        ]
      }
    },
    {
      "name": "TranchingMarketFinancials",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "sr_raw_net_asset", "docs": ["Senior raw net asset value"], "type": {"defined": {"name": "Number"}}},
          {"name": "jr_raw_net_asset", "docs": ["Junior raw net asset value"], "type": {"defined": {"name": "Number"}}},
          {"name": "sr_effective_net_asset", "docs": ["Senior effective net asset value"], "type": {"defined": {"name": "Number"}}},
          {"name": "jr_effective_net_asset", "docs": ["Junior effective net asset value"], "type": {"defined": {"name": "Number"}}},
          {"name": "sr_impermanent_loss", "docs": ["Senior impermanent loss balance"], "type": {"defined": {"name": "Number"}}},
          {"name": "jr_impermanent_loss", "docs": ["Junior impermanent loss balance"], "type": {"defined": {"name": "Number"}}},
          {"name": "utilization", "docs": ["Current utilization"], "type": {"defined": {"name": "Number"}}},
          {"name": "current_junior_return_share", "docs": ["Last distributed junior return share"], "type": {"defined": {"name": "Number"}}},
          {"name": "tw_junior_return_share_accrued", "docs": ["Accrued time-weighted junior return share"], "type": {"defined": {"name": "Number"}}},
          {"name": "last_sync_ts", "docs": ["Last market sync timestamp"], "type": "i64"},
          {"name": "last_distribution_ts", "docs": ["Last yield distribution timestamp"], "type": "i64"},
          {"name": "fixed_term_end_ts", "docs": ["Fixed-term end timestamp, if active"], "type": "i64"}
        ]
      }
    },
    {
      "name": "TranchingMarketRoles",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "admin", "type": {"vec": "pubkey"}},
          {"name": "sentinel", "type": {"vec": "pubkey"}}
        ]
      }
    },
    {
      "name": "TranchingMarketState",
      "type": {
        "kind": "enum",
        "variants": [{"name": "Uninitialized"}, {"name": "Active"}, {"name": "FixedTermRecovery"}]
      }
    },
    {
      "name": "TranchingProtocolFeeConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "protocol_fee_recipient", "docs": ["Protocol fee recipient that receives minted LP fee shares"], "type": "pubkey"},
          {"name": "sr_protocol_fee", "docs": ["Protocol fee charged on senior-side yield retained by senior"], "type": {"defined": {"name": "Number"}}},
          {"name": "jr_protocol_fee", "docs": ["Protocol fee charged on junior-side raw appreciation retained by junior"], "type": {"defined": {"name": "Number"}}},
          {"name": "junior_return_protocol_fee", "docs": ["Protocol fee charged on senior return allocated to junior"], "type": {"defined": {"name": "Number"}}},
          {"name": "senior_deposit_protocol_fee", "docs": ["Protocol fee charged on senior tranche deposits"], "type": {"defined": {"name": "Number"}}},
          {"name": "junior_deposit_protocol_fee", "docs": ["Protocol fee charged on junior tranche deposits"], "type": {"defined": {"name": "Number"}}},
          {"name": "senior_withdraw_protocol_fee", "docs": ["Protocol fee charged on senior tranche withdrawals"], "type": {"defined": {"name": "Number"}}},
          {"name": "junior_withdraw_protocol_fee", "docs": ["Protocol fee charged on junior tranche withdrawals"], "type": {"defined": {"name": "Number"}}}
        ]
      }
    },
    {
      "name": "TranchingRiskConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {"name": "min_coverage", "docs": ["Minimum coverage requirement."], "type": {"defined": {"name": "Number"}}},
          {"name": "beta", "docs": ["Junior downside beta."], "type": {"defined": {"name": "Number"}}},
          {"name": "liquidation_utilization", "docs": ["Liquidation utilization threshold."], "type": {"defined": {"name": "Number"}}},
          {"name": "fixed_term_duration_sec", "docs": ["Fixed-term observation period duration"], "type": "u32"},
          {"name": "min_deposit_amount", "docs": ["Min deposit amount in underlying units"], "type": "u64"},
          {"name": "sr_self_liquidation_bonus", "docs": ["Senior self-liquidation bonus."], "type": {"defined": {"name": "Number"}}},
          {"name": "sr_net_asset_dust_tolerance", "docs": ["Senior NAV dust tolerance."], "type": {"defined": {"name": "Number"}}},
          {"name": "jr_net_asset_dust_tolerance", "docs": ["Junior NAV dust tolerance."], "type": {"defined": {"name": "Number"}}}
        ]
      }
    }
  ]
};

// Broken legacy tranching market with a different account layout.
// Exclude it explicitly to avoid deserialization errors.
const HIDDEN_TRANCHING_MARKET_ADDRESSES = new Set([
  'FkGQbWytiEnLbVDaBT85hyDxqKXmzHJ21GYpEpguSDSk',
])
const TRANCHING_MARKET_DISCRIMINATOR = Buffer.from([119, 38, 120, 122, 60, 24, 58, 160])
const GENERIC_SY_PROGRAM_ID = 'XP1BRLn8eCYSygrd8er5P4GKdzqKbC3DLoSsS5UYVZy'
const SY_META_DISCRIMINATOR = Buffer.from([254, 147, 136, 16, 163, 203, 98, 93])
const GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET = 129
// Tranching Number is fixed-point with 12 decimal places.
const NUMBER_DENOM = 1_000_000_000_000n

function anchorNumberToRaw(value) {
  const words = Array.isArray(value?.[0]) ? value[0] : value
  return words.reduce((sum, word, index) => sum + (BigInt(word.toString()) << (64n * BigInt(index))), 0n)
}

function scaleTranchingNavToTokenRaw(value) {
  // Effective NAV is already denominated in the market accounting asset. DefiLlama expects raw token units.
  return value / NUMBER_DENOM
}

function getAltAddress(lookupTable, context) {
  const index = context?.altIndex
  if (index === undefined) return null
  return lookupTable?.state?.addresses?.[index] || null
}

function hasTranchingMarketDiscriminator(data) {
  return data.length >= 8 && Buffer.from(data.subarray(0, 8)).equals(TRANCHING_MARKET_DISCRIMINATOR)
}

function readGenericSyMetaMintSy(data) {
  return new PublicKey(data.subarray(8, 40))
}

function readGenericSyMetaYieldBearingMint(data) {
  return new PublicKey(data.subarray(
    GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET,
    GENERIC_SY_META_YIELD_BEARING_MINT_OFFSET + 32,
  ))
}

async function getMarketTokenMints(markets) {
  const connection = getConnection()
  // Tranching markets store CPI account indices into their ALT, so resolve the ALT before looking for SY metadata.
  const lookupTableKeys = [...new Set(markets.map(({ account }) => account.addressLookupTable.toBase58()))]
    .map((address) => new PublicKey(address))
  const lookupTableAccounts = await connection.getMultipleAccountsInfo(lookupTableKeys)
  const lookupTables = {}

  lookupTableAccounts.forEach((account, index) => {
    if (!account) return
    const key = lookupTableKeys[index]
    lookupTables[key.toBase58()] = new AddressLookupTableAccount({
      key,
      state: AddressLookupTableAccount.deserialize(account.data),
    })
  })

  const map = {}
  const syMetaCandidates = []

  for (const { account } of markets) {
    const syMint = account.syMint.toBase58()
    // Default to the SY mint. Generic SY can be resolved further on-chain to its yield-bearing mint below.
    map[syMint] = new PublicKey(syMint)

    // Only Generic SY standard supports on-chain yield-bearing mint resolution here.
    if (account.syProgram.toBase58() !== GENERIC_SY_PROGRAM_ID) continue

    const lookupTable = lookupTables[account.addressLookupTable.toBase58()]
    // Generic SY markets include syMeta in depositSy[1] on newer account sets, or getSyState[0] on older ones.
    const candidate =
      getAltAddress(lookupTable, account.syCpiAccounts.depositSy?.[1]) ||
      getAltAddress(lookupTable, account.syCpiAccounts.getSyState?.[0])
    if (candidate) syMetaCandidates.push({ syMint, candidate })
  }

  const syMetaAccounts = syMetaCandidates.length > 0
    ? await connection.getMultipleAccountsInfo(syMetaCandidates.map(({ candidate }) => candidate))
    : []

  syMetaAccounts.forEach((account, index) => {
    if (!account) return
    if (!account.owner.equals(new PublicKey(GENERIC_SY_PROGRAM_ID))) return
    if (!Buffer.from(account.data.subarray(0, 8)).equals(SY_META_DISCRIMINATOR)) return

    const { syMint } = syMetaCandidates[index]
    if (!readGenericSyMetaMintSy(account.data).equals(new PublicKey(syMint))) return

    // Attribute Generic SY TVL to the on-chain yield-bearing mint so DefiLlama can price it directly.
    map[syMint] = readGenericSyMetaYieldBearingMint(account.data)
  })

  return map
}

async function tvl(api) {
  const provider = getProvider()
  const program = new Program(idl, provider)
  const rawAccounts = await provider.connection.getProgramAccounts(program.programId, { commitment: "confirmed" })
  const validAccounts = rawAccounts.filter(
    ({ pubkey, account }) =>
      !HIDDEN_TRANCHING_MARKET_ADDRESSES.has(pubkey.toBase58()) &&
      hasTranchingMarketDiscriminator(account.data)
  )
  const vaults = validAccounts.map(({ pubkey, account }) => ({
    pubkey,
    account: program.coder.accounts.decode("exponentTranchingMarket", account.data),
  }))
  const marketTokenMints = await getMarketTokenMints(vaults)

  for (const { account } of vaults) {
    const marketAddress = account.selfAddress.toBase58()
    if (HIDDEN_TRANCHING_MARKET_ADDRESSES.has(marketAddress)) continue

    const syMint = account.syMint.toBase58()
    const tokenMint = marketTokenMints[syMint]
    if (!tokenMint) continue

    const token = tokenMint.toBase58()

    const total =
      anchorNumberToRaw(account.financials.srEffectiveNetAsset) +
      anchorNumberToRaw(account.financials.jrEffectiveNetAsset)
    if (total <= 0n) continue

    const amount = scaleTranchingNavToTokenRaw(total)
    if (amount <= 0n) continue

    api.add(token, amount.toString())
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: 'TVL is calculated from on-chain data by summing each visible tranching market\'s senior and junior effective NAV. Generic SY markets are attributed to their on-chain yield-bearing mint; other markets fall back to their SY mint.',
  solana: { tvl },
};
