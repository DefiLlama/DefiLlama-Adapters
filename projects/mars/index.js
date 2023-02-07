const axios = require("axios");
const BigNumber = require("bignumber.js");

const zero = (timestamp, block) => ({});

const SCALING_FACTOR = 6;

/**
 * Encode a javascript object into a base64 string.
 */
function encodeBase64(msg) {
  return Buffer.from(JSON.stringify(msg), "utf8").toString("base64");
}

/**
 * Query the total amount of MARS tokens staked on Mars Hub app-chain.
 */
async function queryBondedTokens(timestamp, block) {
  const res = await axios.get(
    "https://rest.marsprotocol.io/cosmos/staking/v1beta1/pool"
  );

  // Staked MARS tokens can be in one of three states: bonded, unbonding, or
  // unbonded. Here we only include those in the bonded state in the TVL.
  let bondedTokensRaw = BigNumber(res.data.pool.bonded_tokens);

  // MARS token has 6 decimal places
  const bondedTokens = bondedTokensRaw.div(1e6);

  return {
    "mars-protocol": bondedTokens.toNumber(),
  };
}

/**
 * Query the TVL of a Red Bank deployment.
 */
async function queryRedBankTvl(restUrl, contractAddr, assets) {
  const query = encodeBase64({ markets: {} });
  const res = await axios.get(`${restUrl}/cosmwasm/wasm/v1/contract/${contractAddr}/smart/${query}`);

  const tvl = {};
  const borrowed = {};

  for (const asset of assets) {
    const market = res
      .data
      .data
      .find((market) => market.denom === asset.denom);

    tvl[asset.coingeckoId] = BigNumber(market.collateral_total_scaled)
      .times(Number(market.liquidity_index))
      .div(BigNumber(10).pow(SCALING_FACTOR))
      .div(BigNumber(10).pow(asset.decimals))
      .toNumber();

    borrowed[asset.coingeckoId] = BigNumber(market.debt_total_scaled)
      .times(Number(market.borrow_index))
      .div(BigNumber(10).pow(SCALING_FACTOR))
      .div(BigNumber(10).pow(asset.decimals))
      .toNumber();
  }

  return { tvl, borrowed };
}

/**
 * Query the TVL of the Osmosis Red Bank deployment.
 */
async function queryOsmosis(timestamp, block) {
  return queryRedBankTvl(
    "https://lcd.osmosis.zone",
    "osmo1c3ljch9dfw5kf52nfwpxd2zmj2ese7agnx0p9tenkrryasrle5sqf3ftpg",
    [
      {
        denom: "uosmo",
        decimals: 6,
        coingeckoId: "osmosis",
      },
      {
        denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
        decimals: 6,
        coingeckoId: "cosmos",
      },
      {
        denom: "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858",
        decimals: 6,
        coingeckoId: "usd-coin",
      },
    ],
  );
}

module.exports = {
  timetravel: false,
  methodology: "We query Mars protocol smart contracts to get the amount of assets deposited and borrowed, then use CoinGecko to price the assets in USD.",
  // mars: {
  //   tvl: queryBondedTokens,
  //   staking: queryBondedTokens,
  // },
  osmosis: {
    tvl: () => queryOsmosis().then((result) => result.tvl),
    borrowed: () => queryOsmosis().then((result) => result.borrowed),
  },
  terra: {
    tvl: zero,
    borrowed: zero,
  },
  hallmarks: [
    [1651881600, "UST depeg"],
    [1675177200, "Relaunch"],
  ],
};
