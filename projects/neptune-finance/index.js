const { queryContract, getToken, sumTokens, getBalance } = require('../helper/chain/cosmos')

const MARKET_ADDR = 'inj1nc7gjkf2mhp34a6gquhurg8qahnw5kxs5u3s4u';

const CW20_ADDRS = [
  ['inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc', 'factory:inj14ejqjyq8um4p3xfqj74yld5waqljf88f9eneuk:inj18luqttqyckgpddndh8hvaq25d5nfwjc78m56lc']
];

async function sumCW20Tokens({
  balances = {},
  tokens,
  owner,
  chain
} = {}) {
  // Loop through each token in the tokens array
  await Promise.all(
    tokens.map(async (token) => {
      // Fetch the balance for the token and owner
      const balance = await getBalance({ token: token[0], owner, chain });
      // Add the balance to the balances object
      if (!isNaN(balance) && typeof balance === 'number' && isFinite(balance)) {
        balances[`injective:${token[1].toString()}`] = balance.toString(); // Convert balance to string and append to 2nd token in array
      }
    })
  );
  return balances;
}

async function tvl(api) {
  let balances = {};

  // Sum the balances of all tokens excluding CW20
  await sumTokens({
    balances,
    chain: api.chain,
    owner: MARKET_ADDR
  });

  // Sum the balances of CW20 tokens
  await sumCW20Tokens({
    balances,
    chain: api.chain,
    tokens: CW20_ADDRS,
    owner: MARKET_ADDR
  });
  
  return balances
}

async function borrowed(api) {
  // query market-state
  const { markets, } = await queryContract({
    chain: api.chain,
    contract: MARKET_ADDR,
    data: {
      get_state: {}
    }
  })

  // get all borrowed
  markets.map(market => {
    let denom = getToken(market[0])
    api.add(denom, market[1].debt_pool.balance)
  })
}

module.exports = {
  methodology: 'Counts the total collateral and non-borrowed lent assets managed by Neptune on Injective',
  injective: {
    tvl, borrowed
  }
};