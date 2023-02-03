const axios = require("axios");
const BigNumber = require("bignumber.js");

const zero = (timestamp, block) => ({});

/**
 * Query the total amount of MARS tokens staked on Mars Hub app-chain.
 */
const queryBondedTokens = async (timestamp, block) => {
  const res = await axios.get(
    "https://rest.marsprotocol.io/cosmos/staking/v1beta1/pool"
  );

  // Staked MARS tokens can be in one of three states: bonded, unbonding, or
  // unbonded. Here we only include those in the bonded state in the TVL.
  const bondedTokensRaw = BigNumber(res.data.pool.bonded_tokens);

  // MARS token has 6 decimal places
  const bondedTokens = bondedTokensRaw.div(1e6);

  return {
    "mars-protocol": bondedTokens.toNumber(),
  };
};

module.exports = {
  timetravel: false,
  methodology:
    "We query Mars protocol smart contracts to get the amount of assets deposited and borrowed, then use CoinGecko to price the assets in USD.",
  mars: {
    tvl: queryBondedTokens,
    staked: queryBondedTokens,
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
