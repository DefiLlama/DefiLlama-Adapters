const { getTokenAccountBalances } = require('../helper/solana');

async function tvl() {
  // Solana USDC Token Account for Signal Treasury Wallet: FVyGEtqSKPHkiKgeSa8imWW5gzWNN5A5txwJgs7zFQhb
  const tokenAccounts = [
    '5N7NsW5yau8bCZjpyzZV4KpMUAVVdw3HMui4ad7pcm9B'
  ];
  return getTokenAccountBalances(tokenAccounts);
}

module.exports = {
  timetravel: false,
  solana: {
    tvl
  }
};
