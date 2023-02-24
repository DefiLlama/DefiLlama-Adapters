const { getConfig } = require('../helper/cache')

const {getTokenAccountBalance} = require('../helper/solana');

async function tvl() {
  // this is a list of token accounts that are reserves of a swap
  // more details: https://github.com/senchahq/sencha-registry
  const senchaTokenAccounts= await getConfig('sencha',
    "https://raw.githubusercontent.com/SenchaHQ/sencha-registry/master/data/known-accounts.json"
  );

  const tvlResult = {};
  await Promise.all(
    senchaTokenAccounts.map(async ({ coingeckoId, account }) => {
      const amount = await getTokenAccountBalance(account);
      if (!tvlResult[coingeckoId]) {
        tvlResult[coingeckoId] = amount;
      } else {
        tvlResult[coingeckoId] += amount;
      }
    })
  );
  return tvlResult;
}

module.exports = {
  timetravel: false,
  methodology:
    "Sencha TVL is computed by iterating each known Sencha pool, then taking the value of each of the underlying tokens. Assets not listed on Coingecko are not counted.",
  solana: {
    tvl,
  }
  
};
