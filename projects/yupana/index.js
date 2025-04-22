const sdk = require("@defillama/sdk")
const {
  getStorage,
  getBigMapById,
  sumTokens2,
} = require("../helper/chain/tezos");

const YUPANA_CORE = "KT1Rk86CX85DjBKmuyBhrCyNsHyudHVtASec";
const YUPANA_CORE_V2 = "KT1CojtgtVHVarS135fnV3y4z8TiKXrsRHJr"; // https://twitter.com/YupanaFinance/status/1739216683728797802

async function tvl() {
  return sumTokens2({ owners: [YUPANA_CORE, YUPANA_CORE_V2], includeTezos: true, })
}

async function borrowed() {
  const balances = {};
  await Promise.all([YUPANA_CORE, YUPANA_CORE_V2].map(addBorrowed));

  async function addBorrowed(YUPANA_CORE) {
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
