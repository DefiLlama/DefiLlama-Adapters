const { sumTokens2 } = require("../helper/unwrapLPs");

const BEANSTALK = "0xc1e088fc1323b20bcbee9bd1b9fc9546db5624c5";

const BEAN_ERC20_V1 = "0xdc59ac4fefa32293a95889dc396682858d52e5db";
const BEANETH_V1 = "0x87898263B6C5BABe34b4ec53F22d98430b91e371";
const BEAN3CRV_V1 = "0x3a70DfA7d2262988064A2D051dd47521E43c9BdD";
const BEANLUSD_V1 = "0xd652c40fbb3f06d6b58cb9aa9cff063ee63d465d";

const BEAN_ERC20 = "0xBEA0000029AD1c77D3d5D23Ba2D8893dB9d1Efab";
const UNRIPE_BEAN_ERC20 = "0x1bea0050e63e05fbb5d8ba2f10cf5800b6224449";
const UNRIPE_LP_ERC20 = "0x1bea3ccd22f4ebd3d37d731ba31eeca95713716d";
const BEAN3CRV_V2 = "0xc9c32cd16bf7efb85ff14e0c8603cc90f6f2ee49";
const BEANETH_V2 = "0xbea0e11282e2bb5893bece110cf199501e872bad";

/// REFERENCE                 BLOCKS    TIMESTAMPS
// Whitelist    BEANETH_V1    12974075  1628288832
// Dewhitelist  BEANETH_V1    14602790  1650198256
// Whitelist    BEAN3CRV_V1   14218934  1645038020
// dewhitelist  BEAN3CRV_V1   14602790  1650198256
// whitelist    BEANLUSD_V1   14547427  1649451979
// dewhitelist  BEANLUSD_V1   14602790  1650198256
// EXPLOIT_BLOCK              14602790  1650198256
// REPLANT_BLOCK              15278963  1659657966
// whitelist    BEAN3CRV_V2   15278082  1659645914
// dewhitelist  BEAN3CRV_V2   19927634  1716407627
// whitelist    BEANETH_V2    18028591  1693412759
// dewhitelist  BEANETH_V2    x

const EXPLOIT_TIME = 1650198256;
const REPLANT_TIME = 1659657966;

// List of pools and time time periods they were on the silo whitelist
const POOLS = {
  [BEANETH_V1]: {
    startTime: 1628288832,
    endTime: EXPLOIT_TIME,
  },
  [BEAN3CRV_V1]: {
    startTime: 1645038020,
    endTime: EXPLOIT_TIME,
  },
  [BEANLUSD_V1]: {
    startTime: 1649451979,
    endTime: EXPLOIT_TIME,
  },
  [BEAN3CRV_V2]: {
    startTime: 1659645914,
    endTime: 1716407627, // Dewhitelisted upon BIP-45 deployment
  },
  [BEANETH_V2]: {
    startTime: 1693412759,
    endTime: 999999999999,
  }
};

// Beans deposited in the silo
async function staking(api) {
  if (api.timestamp >= EXPLOIT_TIME && api.timestamp <= REPLANT_TIME) {
    return {};
  }

  const tokensAndOwners = [[BEAN_ERC20, BEANSTALK]];
  // TODO: modify this to use getTotalDeposited once it became available on block 14218934 (BIP-12)
  // Before BIP-12: totalDepositedBeans and totalDepositedLP
  const balances = await sumTokens2({balances: {}, tokensAndOwners, api });
  return balances;
}

// Bean LP deposited in the silo
async function pool2(api) {
  if (api.timestamp >= EXPLOIT_TIME && api.timestamp <= REPLANT_TIME) {
    return {};
  }

  const tokensAndOwners = [];

  for (const contract in POOLS) {
    const pool = POOLS[contract];
    if (api.timestamp >= pool.startTime && api.timestamp <= pool.endTime) {
      tokensAndOwners.push([contract, BEANSTALK]);
    }
  }

  const balances = await sumTokens2({balances: {}, tokensAndOwners, api });
  return balances;
}

// Unripe tokens
async function vesting(api) {
  if (api.timestamp <= REPLANT_TIME) {
    return {};
  }

  const tokensAndOwners = [[UNRIPE_BEAN_ERC20, BEANSTALK], [UNRIPE_LP_ERC20, BEANSTALK]];
  const balances = await sumTokens2({balances: {}, tokensAndOwners, api });
  return balances;
}

module.exports = {
  doublecounted: true,
  methodology: "Counts the value of deposited Beans and LP tokens in the silo.",
  start: 12974077,
  timetravel: true,
  ethereum: {
    // tvl,
    tvl: async () => ({}),
    pool2,
    staking,
    vesting
  },
  hallmarks: [
    [1650153600, "Governance Exploit"],
    [1659602715, "Replant"]
  ]
};
