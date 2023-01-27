const sdk = require("@defillama/sdk")
const {
  getStorage,
  getBigMapById,
  sumTokens2,
} = require("../helper/chain/tezos");
const YUPANA_CORE = "KT1Rk86CX85DjBKmuyBhrCyNsHyudHVtASec";

async function tvl() {
  return sumTokens2({ owners: [YUPANA_CORE], includeTezos: true, })
}

async function borrowed() {
  const balances = {};
  const storage = await getStorage(YUPANA_CORE);
  const tokens_map = await getBigMapById(storage.storage.tokens);
  for (const id in tokens_map) {
    const token = tokens_map[id];
    const token_borrows = token.totalBorrowsF / 1e18;
    let token_address;
    if (token.mainToken.fA2)
      token_address =
        `${token.mainToken.fA2.address}` +
        (token.mainToken.fA2.nat > 0 ? "-" + token.mainToken.fA2.nat : "");
    else
      token_address = `${token.mainToken.fA12}`;
    sdk.util.sumSingleBalance(balances, token_address, token_borrows, 'tezos');
  }
  return balances
}

module.exports = {
  timetravel: false,
  tezos: {
    tvl,
    borrowed,
  },
  methodology:
    'TVL counts the liquidity, reserves for each market.',
};
