const { sumTokens} = require('../helper/chain/cosmos');

const addresses = {
  injective: {
    redBank: 'inj1dffuj4ud2fn7vhhw7dec6arx7tuyxd56srjwk4',
    creditManager: 'inj1da4kst7293x7g43sxdx6hnppkqmr5aaf2hanhj',
    params: 'inj1xuf0xk9583ry4wczmxulleuhrw6dqtlnvvcx56'
  },
}

async function injectiveTVL() {
  let balances = {};
  await addRedBankTvl(balances, 'injective');
  return balances;
}


async function addRedBankTvl(balances, chain) {
  let a = await sumTokens({balances, owners: [addresses[chain].redBank], chain});
  return a
}

module.exports = {
  timetravel: false,
  methodology: 'For Injective chain, sum token balances in Bank/Credit Manager smart contracts to approximate net deposits, plus vault underlying assets held',
  injective: {
    tvl: injectiveTVL,
  },
};
