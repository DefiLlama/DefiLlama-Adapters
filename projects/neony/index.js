const { sumTokens2 } = require('../helper/solana');

const TREASURY_WALLETS = [
  'CzewUJa69Mg1edR8womYzCJaHK5QtR7ymJU4924LBS5x',
  'omJhdDwnGiViXtateVXB1pm5B4iWwrj95f2ZMFeGhkW',
];

async function tvl(api) {

  return sumTokens2({
    api,
    owners: TREASURY_WALLETS,
    solOwners: TREASURY_WALLETS,
  });
}

module.exports = {
  methodology: 'TVL counts all SPL tokens and native SOL held in Neony treasury wallets on Solana.',
  timetravel: true,
  start: '2026-03-05',
  solana: { tvl },
};
