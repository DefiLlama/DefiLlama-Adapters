const { sumTokens2 } = require('../helper/solana')

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
  kmSOL: 'FYjUbv4GTuRNpy1AP8tW7RAMjVdWipzwXGUvjxU6dqJE',
  kmUSDC: '8izCwLytk6QmHYRbh7vHSUgsNkgPctG2jeh2sSc2bRzU',
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

async function tvl(api) {
  return sumTokens2({ api, tokenAccounts: Object.values(vaults) })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the SPL token balances held in the token account of each Umbra shielded pool on Solana, read directly from chain state. Every pool custodies user deposits in a single token account owned by the pool PDA, so the balance of that account is the pool\'s outstanding deposits. Nothing is borrowed, lent, rehypothecated or double counted, and Umbra\'s own token is counted only where users have actually deposited it into the UMBRA pool.',
  solana: { tvl },
}
