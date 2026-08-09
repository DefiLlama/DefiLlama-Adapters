const { PublicKey } = require('@solana/web3.js')
const { Program } = require('@project-serum/anchor')
const { getConfig } = require('../helper/cache')
const { getConnection, getMultipleAccounts } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')

const VAULTS_API = 'https://stats.askloyal.com/api/earn/vaults'

const KLEND_PROGRAM_ID = new PublicKey('KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD')

// RiskBasket.Safe — packages/loyal-actions/src/constants.ts
const SAFE_MARKETS = [
  '7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF', // Main
  'CqAoLuqWtavaVE8deBjMKe8ZfSt9ghR6Vb8nfsyabyHA', // Figure
  '6WEGfej9B9wjxRs6t4BYpb9iCXd8CpTpJ8fVSNzHCC5y', // Maple
  '47tfyEG9SsdEnUm9cw5kY9BXngQGqu3LBoop9j5uTAv8', // OnRe
  'BJnbcRHqvppTyGesLzWASGKnmnF1wq9jZu6ExrjT7wvF', // Ethena
]

// KAMINO_VANILLA_OBLIGATION_TAG / ID from loyal-actions constants
const OBLIGATION_TAG = 0
const OBLIGATION_ID = 0

const SF = 2 ** 60 // Kamino scaled-fraction

// Minimal IDL to decode Obligation.deposits[].marketValueSf
const klendIdl = {
  version: '0.1.0',
  name: 'klend',
  instructions: [],
  accounts: [
    {
      name: 'obligation',
      type: {
        kind: 'struct',
        fields: [
          { name: 'tag', type: 'u64' },
          { name: 'lastUpdate', type: { defined: 'LastUpdate' } },
          { name: 'lendingMarket', type: 'publicKey' },
          { name: 'owner', type: 'publicKey' },
          { name: 'deposits', type: { array: [{ defined: 'ObligationCollateral' }, 8] } },
        ],
      },
    },
  ],
  types: [
    {
      name: 'LastUpdate',
      type: {
        kind: 'struct',
        fields: [
          { name: 'slot', type: 'u64' },
          { name: 'stale', type: 'u8' },
          { name: 'priceStatus', type: 'u8' },
          { name: 'placeholder', type: { array: ['u8', 6] } },
        ],
      },
    },
    {
      name: 'ObligationCollateral',
      type: {
        kind: 'struct',
        fields: [
          { name: 'depositReserve', type: 'publicKey' },
          { name: 'depositedAmount', type: 'u64' },
          { name: 'marketValueSf', type: 'u128' },
          { name: 'borrowedAmountAgainstThisCollateralInElevationGroup', type: 'u64' },
          { name: 'padding', type: { array: ['u64', 9] } },
        ],
      },
    },
  ],
}

function deriveVanillaObligation(owner, market) {
  const [pda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from([OBLIGATION_TAG]),
      Buffer.from([OBLIGATION_ID]),
      new PublicKey(owner).toBuffer(),
      new PublicKey(market).toBuffer(),
      PublicKey.default.toBuffer(),
      PublicKey.default.toBuffer(),
    ],
    KLEND_PROGRAM_ID,
  )
  return pda
}

async function tvl(api) {
  const connection = getConnection()
  const data = await getConfig('loyal/vaults', VAULTS_API)
  const owners = Array.isArray(data) ? data : (data.vaults || [])

  if (!owners.length) {
    api.log('[Loyal] empty vault list')
    return {}
  }
  api.log(`[Loyal] ${owners.length} vaults × ${SAFE_MARKETS.length} markets`)

  const obligationPubkeys = []
  for (const owner of owners) {
    for (const market of SAFE_MARKETS) {
      obligationPubkeys.push(deriveVanillaObligation(owner, market))
    }
  }

  const accountInfos = await getMultipleAccounts(obligationPubkeys, { api })
  const program = new Program(klendIdl, KLEND_PROGRAM_ID, {
    connection,
    publicKey: PublicKey.unique(),
  })

  let active = 0
  for (const info of accountInfos) {
    if (!info?.data) continue
    try {
      const decoded = program.coder.accounts.decode('obligation', info.data)
      for (const d of decoded.deposits) {
        if (d.depositReserve.equals(PublicKey.default)) continue
        const usd = Number(d.marketValueSf.toString()) / SF
        if (usd > 0) {
          // Report as USDC (6 decimals) so DefiLlama prices at ~$1
          api.add(ADDRESSES.solana.USDC, Math.round(usd * 1e6))
          active++
        }
      }
    } catch {
      // missing / empty obligation
    }
  }

  api.log(`[Loyal] ${active} non-zero collateral slots`)
  return api.getBalances()
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the on-chain USD market value of collateral deposited by Loyal Earn Squads smart accounts into Kamino Lend obligations across the five RiskBasket.Safe markets (Main, Figure, Maple, OnRe, Ethena). Vault addresses are fetched from the public Loyal stats API; obligation values are read on-chain via marketValueSf.',
  solana: { tvl },
}