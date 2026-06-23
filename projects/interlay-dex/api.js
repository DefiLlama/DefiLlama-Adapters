const { getAPI, addTokenBalance } = require('../helper/acala/interlay-api');

async function tvl() {
  const chain = "interlay";
  const api = await getAPI(chain);
  const balances = {};

  const pools = (await api.query.dexGeneral.pairStatuses.keys()).slice(0, 20);

  for (const key of pools) {
    const tokenPair = key.args[0];
    const [token0, token1] = tokenPair;

    const info = await api.query.dexGeneral.pairStatuses(tokenPair);
    const json = info.toJSON();
    const pairAccount = json?.trading?.pairAccount;

    if (!pairAccount) continue;

    const [amount0Codec, amount1Codec] = await Promise.all([
      api.query.tokens.accounts(pairAccount, token0),
      api.query.tokens.accounts(pairAccount, token1),
    ]);

    const amount0 = Number(amount0Codec.toJSON().free);
    const amount1 = Number(amount1Codec.toJSON().free);

    addTokenBalance({ balances, chain, atomicAmount: amount0, ccyArg: token0 });
    addTokenBalance({ balances, chain, atomicAmount: amount1, ccyArg: token1 });
  }

  return balances;
}

module.exports = {
  timetravel: false,
  methodology: "Tracks TVL on Interlay's DEX.",
  interlay: { tvl },
};

