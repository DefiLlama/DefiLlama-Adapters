const { sumTokens2 } = require('../helper/solana');

const GRAPH_ENDPOINT = 'https://graph.sablier.io/lockup-mainnet/subgraphs/name/sablier-lockup-solana-mainnet';

const query = `
{
  streams {
    funderAta
  }
}
`;

async function tvl() {
  const result = await fetch(GRAPH_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  }).then(res => res.json());

  if (!result.data) throw new Error(`Graph query failed: ${JSON.stringify(result)}`);

  return sumTokens2({ tokenAccounts: result.data.streams.map(s => s.funderAta) });
}

module.exports = {
  timetravel: false,
  solana: { tvl }
};
