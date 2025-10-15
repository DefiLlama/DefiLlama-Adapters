// adapters/tradersdex-launchpad.ts
import ADDRESSES from '../helpers/coreAssets.json'
import { Dependencies, FetchOptions, SimpleAdapter } from "../adapters/types";
import { CHAIN } from "../helpers/chains";
import { queryDuneSql } from "../helpers/dune";

// ---- CONFIG ----
const PROGRAM_ID = 'TDEXxqqkyJ4Jh8UtLB5BzYoxbJKHwo3FFGKc5GeS1H6'
// Anchor discriminator (8 bytes)
const LOG_TRADE_SELECTOR_HEX = '0x02899fa8fcc41099' // [2,137,159,168,252,196,16,153]

/**
 * We decode the Anchor-serialized payload laid out as:
 *   discriminator (8)
 *   pool (32)
 *   trader (32)
 *   mint (32)
 *   sol_amount (u64, LE)      @ offset 104
 *   token_amount (u64, LE)    @ 112 (unused here)
 *   fee_amount (u64, LE)      @ 120
 *   creator_fee (u64, LE)     @ 128
 *   protocol_fee (u64, LE)    @ 136
 *   is_buy (u8)               @ 144 (unused)
 *   vr_quote (u64, LE)        @ 145 (unused)
 *   vr_token (u64, LE)        @ 153 (unused)
 *   raised_quote (u64, LE)    @ 161 (unused)
 *   sold_supply (u64, LE)     @ 169 (unused)
 *   timestamp (i64, LE)       @ 177 (unused; we rely on block_time)
 *
 * All integers are little-endian (Borsh). Units for sol_amount/fees are lamports.
 */

interface Row {
  fee_amount: string | number
  protocol_fee: string | number
  creator_fee: string | number
}

const fetch = async (_a: any, _b: any, options: FetchOptions) => {
  const rows: Row[] = await queryDuneSql(options, `
    WITH decoded AS (
    SELECT
        -- All are little-endian u64 → reverse before to_uint
        BYTEARRAY_TO_UINT256(BYTEARRAY_REVERSE(BYTEARRAY_SUBSTRING(data, 105, 8))) AS sol_amount,    
        BYTEARRAY_TO_UINT256(BYTEARRAY_REVERSE(BYTEARRAY_SUBSTRING(data, 121, 8))) AS fee_amount,    
        BYTEARRAY_TO_UINT256(BYTEARRAY_REVERSE(BYTEARRAY_SUBSTRING(data, 129, 8))) AS creator_fee,   
        BYTEARRAY_TO_UINT256(BYTEARRAY_REVERSE(BYTEARRAY_SUBSTRING(data, 137, 8))) AS protocol_fee,  
        block_time
    FROM solana.instruction_calls
    WHERE
        tx_success = TRUE
        AND inner_executing_account = 'TDEXxqqkyJ4Jh8UtLB5BzYoxbJKHwo3FFGKc5GeS1H6'
        AND VARBINARY_STARTS_WITH(data, 0x02899fa8fcc41099) -- TRADERSDEX_CURVE_LOG_TRADE
        AND TIME_RANGE
    )
    SELECT
    SUM(sol_amount)   AS sol_amount,
    SUM(fee_amount)   AS fee_amount,
    COALESCE(SUM(creator_fee), 0)  AS creator_fee,
    COALESCE(SUM(protocol_fee), 0) AS protocol_fee
    FROM decoded;
  `, { extraUIDKey: 'tradersdex-launchpad-fees' });

  const dailyFees = options.createBalances()
  const dailyRevenue = options.createBalances()
  const dailyProtocolRevenue = options.createBalances()
  const dailyCreatorRevenue = options.createBalances()
  const dailyVolume = options.createBalances()

  const feeAmt = Number(rows?.[0]?.fee_amount ?? 0)
  const protoAmt = Number(rows?.[0]?.protocol_fee ?? 0)
  const creatorAmt = Number(rows?.[0]?.creator_fee ?? 0)
  const solAmount = Number(rows?.[0]?.sol_amount ?? 0)

  // All amounts are in raw units (lamports); Llama will price SOL.
  const SOL = ADDRESSES.solana.SOL

  // Total fees paid by users
  if (feeAmt > 0) dailyFees.add(SOL, feeAmt, 'LaunchpadFee')

  // Protocol revenue (your cut)
  if (protoAmt > 0) {
    dailyProtocolRevenue.add(SOL, protoAmt, 'ProtocolFees')
    dailyRevenue.add(SOL, protoAmt, 'ProtocolFees') // Llama’s “Revenue”
  }

  // Optional: show creators’ cut separately (nice transparency)
  if (creatorAmt > 0) {
    dailyCreatorRevenue.add(SOL, creatorAmt, 'CreatorFees')
  }

  if (solAmount > 0) dailyVolume.add(SOL, solAmount, 'VolumeSOL')

  // If you later introduce buybacks funded by fees:
  // const dailyHoldersRevenue = options.createBalances()
  // dailyHoldersRevenue.add(SOL, buybackLamports, 'TOKEN_BUY_BACK')
  // and set protocol = fees - holders as needed.

  // Compose final response
  const response: any = {
    dailyFees,
    dailyUserFees: dailyFees.clone(1, 'LaunchpadFee'),
    dailyRevenue,                 // equals protocol revenue in this split
    dailyProtocolRevenue,
    dailyVolume,
  }

  // Include a custom “CreatorRevenue” dimension if you want it visible on the page:
  // Not all dashboards render this by default, but leaving it returned won’t hurt.
  // (If you prefer, fold creator into “SupplySideRevenue” instead.)
  //if (creatorAmt > 0) response['dailyCreatorRevenue'] = dailyCreatorRevenue

  return response
}

const breakdownMethodology = {
  Fees: {
    'LaunchpadFee': 'Total fees paid on launchpad trades (in SOL lamports).',
  },
  Revenue: {
    'ProtocolFees': 'Protocol’s share of launchpad fees (in SOL lamports).',
  },
  ProtocolRevenue: {
    'ProtocolFees': 'Same as Revenue: the protocol’s retained fees.',
  },
  Volume: { 'VolumeSOL': 'Total SOL (lamports) charged as quote-in on launchpad trades.' },
  // If you expose creator revenue:
 /* CreatorRevenue: {
    'CreatorFees': 'Coin creator share of launchpad fees (in SOL lamports).',
  },*/
}

const adapter: SimpleAdapter = {
  version: 1,
  fetch,
  chains: [CHAIN.SOLANA],
  dependencies: [Dependencies.DUNE],
  // Set this to your real go-live date to speed up backfills:
  start: '2025-01-01',
  isExpensiveAdapter: true,
  allowNegativeValue: false,
  breakdownMethodology,
  methodology: {
    Fees: "All fees paid by users on launchpad trades (decoded from inner CPI logs).",
    Revenue: "Protocol's retained share of those fees.",
    ProtocolRevenue: "Same as Revenue.",
    Volume: "Sum of `sol_amount` (quote-in, lamports) from launchpad trades.",
    // If you keep CreatorRevenue enabled:
    // CreatorRevenue: "Creator’s retained share of fees."
  },
}

export default adapter
