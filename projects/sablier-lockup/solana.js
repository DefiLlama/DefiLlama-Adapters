const { sumTokens2 } = require('../helper/solana');

const GRAPH_ENDPOINT = 'https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet';

const query = `{ streams { funderAta } }`;

const BLACKLISTED_ACCOUNTS = new Set([
  'jjJ7sjcbZ1C7FDFmykBfGK7Fo7AZ8UuKhcJKL5MYEwm',
])

async function tvl() {
  const result = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  }).then(res => res.json());

  if (!result.data) throw new Error(`Graph query failed: ${JSON.stringify(result)}`);

  const tokenAccounts = result.data.streams
    .map((s) => s.funderAta)
    .filter((a) => a && !BLACKLISTED_ACCOUNTS.has(a));

  return sumTokens2({ tokenAccounts });
}

module.exports = {
  timetravel: false,
  solana: { tvl }
};
