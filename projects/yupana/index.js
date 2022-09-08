const sdk = require("@defillama/sdk")
const {
  convertBalances,
  getTokenBalances,
  getStorage,
  getBigMapById,
} = require("../helper/tezos");
const { getFixBalances } = require('../helper/portedTokens')
const { default: BigNumber } = require("bignumber.js");
const YUPANA_CORE = "KT1Rk86CX85DjBKmuyBhrCyNsHyudHVtASec";
const wTEZ = "KT1UpeXdK6AJbX58GJ92pLZVCucn2DR8Nu4b";

async function tvl() {
  const fixBalances = await getFixBalances("tezos");
  const balances = await getTokenBalances(YUPANA_CORE, true);
  if (wTEZ in balances) {
    // calculation of wrapped XTZ. Price always 1 to 1 to XTZ.
    const wTez_balance = new BigNumber(balances[wTEZ]);
    delete balances[wTEZ];
    sdk.util.sumSingleBalance(
      balances,
      "tezos",
      +wTez_balance.div(10 ** 6).toFixed(18)
    );
  }
  return fixBalances(await convertBalances(balances));
}

async function borrowed() {
  const balances = {};
  const fixBalances = await getFixBalances("tezos");
  const storage = await getStorage(YUPANA_CORE);
  const tokens_map = await getBigMapById(storage.storage.tokens);
  for (const id in tokens_map) {
    const token = tokens_map[id];
    const token_borrows = new BigNumber(token.totalBorrowsF).div(10 ** 18);
      if (token.mainToken.fA2 && token.mainToken.fA2.address === wTEZ)
        // calculation of wrapped XTZ. Price always 1 to 1 to XTZ.
        sdk.util.sumSingleBalance(
          balances,
          "tezos",
          +token_borrows.div(10 ** 6).toFixed(18)
        );
      else {
        let token_address;
        if (token.mainToken.fA2)
          token_address =
            `${token.mainToken.fA2.address}` +
            (token.mainToken.fA2.nat > 0 ? "-" + token.mainToken.fA2.nat : "");
        else
          token_address = `${token.mainToken.fA12}`;
        sdk.util.sumSingleBalance(
          balances,
          token_address,
          +token_borrows.toFixed(18)
        );
      }
  }
  return fixBalances(await convertBalances(balances));
}

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  tezos: {
    tvl,
    borrowed,
  },
  methodology:
    'TVL counts the liquidity, reserves for each market.',
};
