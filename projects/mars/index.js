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
  let bondedTokensRaw = BigNumber(res.data.pool.bonded_tokens);

  // For the first month after Mars Hub's launch, in order to bootstrap the
  // chain's security, 50M MARS from the community pool are delegated to the
  // genesis validators via a smart contract. These 50M should not be counted in
  // the TVL.
  //
  // After the 1 month mark, this delegation will be unstaked and returned to
  // the community pool.
  //
  // TODO: Once unstaked, delete this part
  const res2 = await axios.get(
    "https://rest.marsprotocol.io/cosmos/staking/v1beta1/delegations/mars1nc5tatafv6eyq7llkr2gv50ff9e22mnf70qgjlv737ktmt4eswrqhnhf0l"
  );
  const communityDelegationRaw = res2.data.delegation_responses.reduce(
    (acc, curr) => acc.plus(BigNumber(curr.balance.amount)),
    BigNumber(0)
  );
  bondedTokensRaw = bondedTokensRaw.minus(communityDelegationRaw);

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
