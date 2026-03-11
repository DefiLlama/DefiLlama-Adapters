const sdk = require('@defillama/sdk');
const { sumTokens2 } = require('../helper/solana');

const TREASURY_WALLETS = [
  'CzewUJa69Mg1edR8womYzCJaHK5QtR7ymJU4924LBS5x',
  'omJhdDwnGiViXtateVXB1pm5B4iWwrj95f2ZMFeGhkW',
];

async function tvl(api) {
  const solanaApi = new sdk.ChainApi({
    chain: 'solana',
    timestamp: api.timestamp,
  });

  await sumTokens2({
    api: solanaApi,
    owners: TREASURY_WALLETS,
    solOwners: TREASURY_WALLETS,
  });

  return solanaApi.getBalances();
}

module.exports = {
  methodology: 'TVL counts all SPL tokens and native SOL held in Neony treasury wallets on Solana.',
  timetravel: true,
  start: '2026-03-05',
  neony: { tvl },
};
