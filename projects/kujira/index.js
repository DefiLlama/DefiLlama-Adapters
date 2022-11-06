const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");
const { transformBalances } = require('../helper/portedTokens')

const COINGECKO_ID = "kujira";

const USK_MARKETS = [
  "kujira1ecgazyd0waaj3g7l9cmy5gulhxkps2gmxu9ghducvuypjq68mq2smfdslf",
];

async function staking() {
  const res = await get(
    "https://lcd.kaiyo.kujira.setten.io/cosmos/staking/v1beta1/pool"
  );

  const { pool } = res;

  return { [COINGECKO_ID]: parseInt(pool.bonded_tokens) / 10 ** 6 };
}

async function tvl() {
  const { pairs } = await get("https://api.kujira.app/api/coingecko/pairs");
  const { contracts: blackWhaleVaults } = await get(
    "https://lcd.kaiyo.kujira.setten.io/cosmwasm/wasm/v1/code/16/contracts?pagination.limit=100"
  );
  const balances = {};
  await Promise.all(
    [
      ...pairs.map((pair) => pair.pool_id),
      ...USK_MARKETS,
      ...blackWhaleVaults,
    ].map(async (addr) => {
      const res = await get(
        `https://lcd.kaiyo.kujira.setten.io/cosmos/bank/v1beta1/balances/${addr}`
      );
      res.balances.forEach((b) => {
        sdk.util.sumSingleBalance(balances, b.denom, b.amount);
      });
    })
  );

  return transformBalances('kujira', balances);
}

module.exports = {
  kujira: {
    tvl,
    // staking, // we do not include chain staking , this is meant for protocols
  },
};
