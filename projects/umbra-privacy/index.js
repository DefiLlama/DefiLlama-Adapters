const ADDRESSES = require('../helper/coreAssets.json')
const { PublicKey } = require('@solana/web3.js')
const { Program } = require('@project-serum/anchor')
const { sumTokens2, getConnection, getTokenAccountBalances } = require('../helper/solana')
const kaminoIdl = require('../kamino-lending/kamino-lending-idl.json')

const KLEND_PROGRAM_ID = 'KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD'

/**
 * Umbra Privacy — shielded pools on Solana.
 *
 * Each Umbra pool is a program-derived account that owns exactly one SPL token
 * account, and that token account custodies every deposit made into the pool.
 * A deposit (shield) credits it, a withdrawal (unshield) debits it, so its
 * balance is the pool's outstanding user deposits with no further adjustment.
 *
 * The addresses below are the token accounts, not the pool PDAs. They were
 * resolved with getTokenAccountsByOwner(poolPda, { mint }) and each one
 * reconciles exactly against the sum of its own deposit/withdrawal history.
 */
const vaults = {
  ARX: 'CMUZ78PEWuNYJXGRadYzGjhD7vTVyWkhsm642yEwUG4a',
  BOT: '26a7ELo9EfiyY2YA9LrPrirkq92K1FZXRrfKBuZ7LEEC',
  CASH: 'GNDRCX6kRV8AsMCXmJfxDg866KTw3QenGWeEWXzwZq8N',
  HYPE: 'Ga87zMHeEwMTCgD3YpRw2Q7ewpRkv87ZarfAcGz9CH8Z',
  PAXG: '4MePm5hCqMi5QR45osYS9aduUCyfkgUWzQS72JRWhdu8',
  SOL: '2FJpuSRLerXMPHHJWq24u8jF1XFdZwHxiddt7EyW5t7A',
  SOLANA: 'GWM8sZCwEn4Km83hmusN6jZNWA8ixPqbCEjSEFYi12bZ',
  SPCX: '7sS5kfooMxeUi26hQHSBxppEipwfEhXkrX1HKEfrepNW',
  UMBRA: '21qPandvcSgmRXfAEmjec2Q44R3M4PLfc8UMNWam449U',
  USDC: 'HXCTEUpb7J1F545V44rstmdXk7oYzV8zPcjt4xx9mz7L',
  USDT: '81xeQ3U6LGjQXngptUReL2brrFCuQAFsxk4SCCjjmF42',
  WBTC: 'goYqJvvHT55CbAGMF1rhSjzpMZaAh9y1MCFo4c5wk8d',
  ZEC: '8tnVpdZDhx7Lahp7VmCqMF4MSDUykeQRrr1msKQz1Ktc',
  ZINC: '8NCJmZqD1r75v5YRhC27EbRsqLU5AzZwNaXYppeCXWfk',
}

/**
 * Two pools hold kmSOL / kmUSDC — receipt tokens of Overpass's Kamino wrapper
 * (program WRAPdXmxrH37RKUbH1QMnYrKdNe8w4Kz44t1cXmYeum). The wrapper's mint
 * authority holds the backing kTokens, and withdrawing burns the receipt and
 * redeems the underlying from the Kamino Lend main market. The receipts do not
 * trade anywhere, so these two pools are counted at redemption value in the
 * underlying token:
 *   pool balance × (authority kToken balance × Kamino exchange rate) ÷ receipt supply
 */
const kaminoWrappedVaults = [
  {
    vault: 'FYjUbv4GTuRNpy1AP8tW7RAMjVdWipzwXGUvjxU6dqJE', // umbra kmSOL pool token account
    wrapperMint: '5EKV8P6r54Fg74JRd7gPC9QWjfV6ktw72CQTkp3GbVep', // kmSOL
    wrapperAuthority: '7f1A2sS8b4J4dft6X3N74VGdUF5Np9GpneQjVMTzQXU',
    kTokenMint: '2UywZrUdyqs5vDchy7fKQJKau2RVyuzBev2XKGPDSiX1', // main-market SOL kToken
    reserve: 'd4A2prbA2whesmvHaL88BH6Ewn5N4bTSU2Ze8P6Bc4Q', // main-market SOL reserve
    underlying: ADDRESSES.solana.SOL,
  },
  {
    vault: '8izCwLytk6QmHYRbh7vHSUgsNkgPctG2jeh2sSc2bRzU', // umbra kmUSDC pool token account
    wrapperMint: 'q6wsFT1SsKu1UR74EqbbHarFBQLeQbBiWqdzbSxCMEG', // kmUSDC
    wrapperAuthority: '3kxgo2z49cbn34jzdyeZmAUAFRqfQLJMPtRVaETbVYqb',
    kTokenMint: 'B8V6WVjPxW1UGwVDfxH2d2r8SyT4cqn7dQRK6XneVa7D', // main-market USDC kToken
    reserve: 'D6q6wuQSrifJKZYpR1M8R4YawnLDtDsMmWM1NbBmgJ59', // main-market USDC reserve
    underlying: ADDRESSES.solana.USDC,
  },
]

async function addKaminoWrappedPools(api) {
  const connection = getConnection()
  const program = new Program(kaminoIdl, new PublicKey(KLEND_PROGRAM_ID), { connection, publicKey: PublicKey.unique() })
  const poolBalances = await getTokenAccountBalances(kaminoWrappedVaults.map(i => i.vault), { individual: true })

  for (const [idx, pool] of kaminoWrappedVaults.entries()) {
    const poolBalance = +poolBalances[idx].amount
    if (!poolBalance) continue

    const [reserve, supply, backingAccounts] = await Promise.all([
      program.account.reserve.fetch(new PublicKey(pool.reserve)),
      connection.getTokenSupply(new PublicKey(pool.wrapperMint)),
      connection.getParsedTokenAccountsByOwner(new PublicKey(pool.wrapperAuthority), { mint: new PublicKey(pool.kTokenMint) }),
    ])
    const wrapperSupply = +supply.value.amount
    if (!wrapperSupply) continue
    const backingKTokens = backingAccounts.value.reduce((a, i) => a + +i.account.data.parsed.info.tokenAmount.amount, 0)

    // Kamino collateral exchange rate: total reserve liquidity per kToken (raw/raw)
    const scale = 2 ** 60 // Sf fields are scaled fractions
    const totalLiquidity = +reserve.liquidity.availableAmount.toString()
      + +reserve.liquidity.borrowedAmountSf.toString() / scale
      - +reserve.liquidity.accumulatedProtocolFeesSf.toString() / scale
      - +reserve.liquidity.accumulatedReferrerFeesSf.toString() / scale
      - +reserve.liquidity.pendingReferrerFeesSf.toString() / scale
    const liquidityPerKToken = totalLiquidity / +reserve.collateral.mintTotalSupply.toString()

    api.add(pool.underlying, backingKTokens * liquidityPerKToken * poolBalance / wrapperSupply)
  }
}

async function tvl(api) {
  await sumTokens2({ api, tokenAccounts: Object.values(vaults) })
  await addKaminoWrappedPools(api)
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology:
    'TVL is the sum of the SPL token balances held in the token account of each Umbra shielded pool on Solana, read directly from chain state. Every pool custodies user deposits in a single token account owned by the pool PDA, so the balance of that account is the pool\'s outstanding deposits. Two pools hold kmSOL and kmUSDC, non-traded receipt tokens of a third-party (Overpass) wrapper over Kamino Lend main-market deposits; those two balances are counted at their on-chain redemption value in SOL and USDC respectively, computed from the wrapper\'s kToken holdings, the Kamino collateral exchange rate and the pool\'s share of the receipt supply. Nothing is borrowed, lent or rehypothecated by Umbra itself, and Umbra\'s own token is counted only where users have actually deposited it into the UMBRA pool.',
  solana: { tvl },
}
