const { getTokenAccountBalance, sumTokens2 } = require('../helper/solana');

const contractAddress = '3Q3pE1izgCeAtTR23eufZy5vCEGtpWLBQcGD2HGd1cbU';

async function tvl() {
  const balances = {};

  await sumTokens2({
    balances,
    owners: [contractAddress],
  });
  
  return balances;
}

module.exports = {
  solana: {
    tvl,
  },
};