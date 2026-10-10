const { BorshAccountsCoder } = require('@project-serum/anchor')
const { getMultipleAccounts, sumTokens2 } = require('../helper/solana')
const ADDRESSES = require('../helper/coreAssets.json')
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json')

const PROGRAM = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'
const MARKET = 'F4uLsGZT4YnHDcemtoYDz2LBZKLmwTB1wzkwS6oqygvy'
// Live market configuration: https://github.com/Nysa-Finance/nysa-frontend/blob/main/src/config.js
const RESERVES = [
  ['rpTGWR3JDjjPfXLCg5Fx1GpSdUxPt1pxW7fwXGUT6js', 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6'], // USDY
  ['GQr5hXuRgHAmguh6EqcpeJXrMyqCQch4P6XkSvawwNk2', ADDRESSES.solana.USDC],
]
const coder = new BorshAccountsCoder(kaminoIdl)

/**
 * Load Nysa's reserves and reject missing or mismatched on-chain accounts.
 * @param {object} api DefiLlama chain API used for Solana account reads.
 * @returns {Promise<object[]>} Decoded reserves with verified program, market, and mint.
 */
async function getReserves(api) {
  const accounts = await getMultipleAccounts(RESERVES.map(([address]) => address), { api })
  return RESERVES.map(([address, mint], i) => {
    const account = accounts[i]
    if (!account) throw new Error(`Nysa: missing reserve ${address}`)
    if (account.owner.toString() !== PROGRAM) throw new Error(`Nysa: unexpected program owner for reserve ${address}`)

    const reserve = coder.decode('Reserve', account.data)
    if (reserve.lendingMarket.toString() !== MARKET) throw new Error(`Nysa: unexpected lending market for reserve ${address}`)
    if (reserve.liquidity.mintPubkey.toString() !== mint) throw new Error(`Nysa: unexpected mint for reserve ${address}`)
    return reserve
  })
}

/**
 * Sum underlying tokens held in the reserves' liquidity supply vaults.
 * @param {object} api DefiLlama chain API receiving raw token balances.
 * @returns {Promise<object>} Vault balances, excluding borrowed-out tokens.
 */
async function tvl(api) {
  const reserves = await getReserves(api)
  return sumTokens2({ api, tokenAccounts: reserves.map(reserve => reserve.liquidity.supplyVault.toString()) })
}

/**
 * Add outstanding debt in raw token units, truncating sub-atomic Q60 dust.
 * @param {object} api DefiLlama chain API receiving borrowed token balances.
 * @returns {Promise<void>} Resolves after adding debt for each validated reserve.
 */
async function borrowed(api) {
  const reserves = await getReserves(api)
  for (const reserve of reserves) {
    // Q60 debt -> raw token units. Use integer arithmetic and discard sub-atomic dust.
    const amount = BigInt(reserve.liquidity.borrowedAmountSf.toString()) / (1n << 60n)
    api.add(reserve.liquidity.mintPubkey.toString(), amount.toString())
  }
}

module.exports = {
  doublecounted: true, // DefiLlama confirmed these deposits overlap Kamino Lend TVL.
  timetravel: false,
  methodology: 'Counts USDY collateral and unborrowed USDC held in the liquidity supply vaults of Nysa\'s curated Kamino market on Solana. Outstanding reserve debt is reported separately as borrowed. Collateral receipt tokens, undistributed incentives, and Farm Points are not added to TVL. These deposits overlap Kamino Lend TVL, so the adapter is marked doublecounted.',
  solana: { tvl, borrowed },
}
