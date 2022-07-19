const sdk = require("@defillama/sdk");
const { get } = require("../helper/http");

const COINGECKO_ID = "kujira";

const TOKENS = {
  ukuji: { coinGeckoId: "kujira", decimals: 6 },
  "ibc/1B38805B1C75352B28169284F96DF56BDEBD9E8FAC005BDCC8CF0378C82AA8E7": {
    coinGeckoId: "weth",
    decimals: 18,
  },
  "ibc/295548A78785A1007F232DE286149A6FF512F180AF5657780FC89C009E2C348F": {
    coinGeckoId: "axlusdc",
    decimals: 6,
  },
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": {
    coinGeckoId: "cosmos",
    decimals: 6,
  },
  "ibc/47BD209179859CDE4A2806763D7189B6E6FE13A17880FE2B42DE1E6C1E329E23": {
    coinGeckoId: "osmosis",
    decimals: 6,
  },
  "ibc/EFF323CC632EC4F747C61BCE238A758EFDB7699C3226565F7C20DA06509D59A5": {
    coinGeckoId: "juno-network",
    decimals: 6,
  },
  "ibc/F3AA7EF362EC5E791FE78A0F4CCC69FEE1F9A7485EB1A8CAB3F6601C00522F10": {
    coinGeckoId: "evmos",
    decimals: 18,
  },
  "ibc/A358D7F19237777AF6D8AD0E0F53268F8B18AE8A53ED318095C14D6D7F3B2DB5": {
    coinGeckoId: "secret",
    decimals: 6,
  },
};

async function staking() {
  const res = await get(
    "https://lcd.kaiyo.kujira.setten.io/cosmos/staking/v1beta1/pool"
  );

  const { pool } = res;

  return { [COINGECKO_ID]: parseInt(pool.bonded_tokens) / 10 ** 6 };
}

async function tvl() {
  const { pairs } = await get("https://api.kujira.app/api/coingecko/pairs");
  const balances = {};
  await Promise.all(
    pairs.map(async (pair) => {
      const res = await get(
        `https://lcd.kaiyo.kujira.setten.io/cosmos/bank/v1beta1/balances/${pair.pool_id}`
      );
      res.balances.forEach((b) => {
        TOKENS[b.denom] &&
          sdk.util.sumSingleBalance(
            balances,
            TOKENS[b.denom].coinGeckoId,
            parseInt(b.amount) / 10 ** TOKENS[b.denom].decimals
          );
      });
    })
  );

  return balances;
}

module.exports = {
  kujira: {
    tvl,
    staking,
  },
};
