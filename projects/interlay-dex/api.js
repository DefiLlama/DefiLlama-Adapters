const { getAPI, addTokenBalance } = require('../helper/interlay/api');

async function tvl(){
  const chain = "interlay";
  const api = await getAPI(chain);

  const data = await api.query.dexGeneral.pairStatuses.entries();
  const balances = {};

  for (let i = 0; i < data.length; i++) {
    const [tokenPair, info] = data[i];
    const pairAccount = info.trading?.pairAccount;
    if (pairAccount === undefined) {
      // not active, skip
      continue;
    }

    const [token0, token1] = tokenPair;
    const [amount0, amount1] = await Promise.all([
      api.query.tokens.accounts(pairAccount, token0),
      api.query.tokens.accounts(pairAccount, token1)
    ]);

    addTokenBalance({balances, atomicAmount: amount0, chain, ccyArg: token0 });
    addTokenBalance({balances, atomicAmount: amount1, chain, ccyArg: token1 });
  }

  return balances;
}


module.exports = {
  timetravel: false,
  methodology: "Tracks TVL on Interlay's DEX.",
  interlay: { tvl }
};


