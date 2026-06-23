const { staking } = require("../helper/staking");

/**
 * INFINIT doesn't have any TVL as no funds are staked on the contracts. 
 * This adapter was made to integrate INFINIT in the Yields dashboard. 
 * For more information on INFINIT, see here: https://infinit.tech
 */

const IN_TOKEN_ADDRESS = "0x61fac5f038515572d6f42d4bcb6b581642753d50";
const IN_STAKING_ADDRESS = "0xc8e6c14ccebed218a64df570025c5a1eeb0cdadc";

const CHAINS = ["bsc", "ethereum", "arbitrum", "base", "optimism", "sonic", "hyperliquid", "mantle", "plasma", "berachain"];

async function tvl() {
  const balances = {};
  return balances;
}

module.exports = {
  methodology: "INFINIT helps user execute transactions and earn yields and rewards on protocols. INFINIT does not hold custody of user's assets thus, it does not have any TVL. See the yield dashboard for a list of INFINIT strategies.",
  ...CHAINS.reduce((acc, chain) => {
    const chainConfig = {
      tvl,
    }

    if (chain === 'bsc') {
      chainConfig.staking = staking(IN_STAKING_ADDRESS, IN_TOKEN_ADDRESS, "bsc");
    }

    acc[chain] = chainConfig;

    return acc;
  }, {})
};
