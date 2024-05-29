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
const BIP12_TIME = 1645038020;

// List of pools and time time periods they were on the silo whitelist
const ALL_POOLS = {
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

// Returns the relevant tokens for the given timestamp
function getBean(timestamp) {
  if (timestamp <= EXPLOIT_TIME) {
    return BEAN_ERC20_V1;
  } else if (timestamp >= REPLANT_TIME) {
    return BEAN_ERC20;
  }
  throw new Error("There was no Bean token during the requested timestamp");
}

// Returns the relevant pools for the given timestamp
function getPools(timestamp) {
  const pools = [];
  for (const contract in ALL_POOLS) {
    const pool = ALL_POOLS[contract];
    if (timestamp >= pool.startTime && timestamp <= pool.endTime) {
      pools.push(contract);
    }
  }
  return pools;
}

// Returns the total silo'd amount of the requested token
async function getSiloDeposited(api, token) {
  
  if (api.timestamp <= BIP12_TIME) {
    // Prior to BIP12, there was no generalized deposit getter
    return await api.call({
      abi: 
        token === BEAN_ERC20_V1
          ? "function totalDepositedBeans() public view returns (uint256)"
          : "function totalDepositedLP() public view returns (uint256)",
      target: BEANSTALK
    });
  } else {
    return await api.call({
      abi: "function getTotalDeposited(address token) external view returns (uint256)",
      target: BEANSTALK,
      params: token
    });
  }
}

// Beans deposited in the silo
async function staking(api) {
  if (api.timestamp >= EXPLOIT_TIME && api.timestamp <= REPLANT_TIME) {
    return {};
  }

  const bean = getBean(api.timestamp);
  const siloBeans = await getSiloDeposited(api, bean);

  return {
    [`ethereum:${bean.toLowerCase()}`]: siloBeans
  }
}

async function pool2(api) {
  if (api.timestamp >= EXPLOIT_TIME && api.timestamp <= REPLANT_TIME) {
    return {};
  }

  const tokensAndOwners = [];

  // Get the amount of lp tokens deposited in the silo
  // Get the amount underlying those lp tokens (which can be priced)

  const pools = getPools(api.timestamp);
  for (const pool of pools) {
    tokensAndOwners.push([pool, BEANSTALK]);
  }

  const balances = await sumTokens2({balances: {}, tokensAndOwners, api });
  return balances;
}

// Unripe tokens
async function vesting(api) {
  if (api.timestamp <= REPLANT_TIME) {
    return {};
  }

  // Get the amount deposited in the silo
  // Get the amount underlying that amount (as beans) which can be priced

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
