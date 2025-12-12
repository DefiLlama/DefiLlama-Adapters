const { sumTokens2 } = require('../helper/solana');

const TOKEN_ACCOUNT = '7MBk8DXFnZCpKDiSwEMFwtyDNqxXMdUSgm52fQ3Chit4';

async function tvl() {
  return sumTokens2({
    tokenAccounts: [TOKEN_ACCOUNT],
  });
}

module.exports = {
  methodology: 'StakeNova is a staking protocol on Solana. TVL includes all user-deposited SOL that generates yield rewards.',
  solana: {
    tvl,
  },
};
