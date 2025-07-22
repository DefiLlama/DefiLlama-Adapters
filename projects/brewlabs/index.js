const { setCache } = require('../helper/cache')
const { sumUnknownTokens } = require('../helper/unknownTokens')
const { post } = require('../helper/http')
const sdk = require('@defillama/sdk')

const chainsList = ["ethereum", "bsc", "polygon"];
const api_endpoint = "https://api.nodes-brewlabs.info/api";

const chains = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  cronos: 25,
  fantom: 250,
  avax: 43114,
  bitgert: 32520,
};
const blacklist = [
  "0x2f6ad7743924b1901a0771746152dde44c5f11de",
  "0xfd6bc48f68136e7bf4ae1fb4b0c2e6911a50e18b",
  "0xafbb5dafacea3cfe1001357449e2ea268e50f368",
  "0x7db5af2b9624e1b3b4bb69d6debd9ad1016a58ac",
];

module.exports = {
  deadFrom: "2025-04-01",
  timetravel: false,
  misrepresentedTokens: true,
};

const data = {
  pool2: {},
  staking: {},
}

async function getStakingPools(chain, poolType) {
  if (!data[poolType][chain]) data[poolType][chain] = _getPools()
  return data[poolType][chain]

  async function _getPools() {
    const poolTypeStr = poolType === 'pool2' ? 'farms' : 'pools'
    const pools = await post(`${api_endpoint}/${poolTypeStr}`, { chainId: chains[chain]})
    setCache(`brewlabs/pools`, chain, pools)
    return pools
  }
}

chainsList.forEach(chain => {
  module.exports[chain] = {
    // tvl: sdk.util.sumChainTvls([staking, pool2]),
    tvl: () => 0,
    pool2,
    staking,
  }
})

async function staking(api) {
  const pools = await getStakingPools(api.chain, 'staking')
  const tokensAndOwners = pools.map(i => ([i.stakingToken.address, i.contractAddress]))
  return sumUnknownTokens({ api, tokensAndOwners, blacklist})
}

const poolInfoAbi = "function poolInfo(uint256) view returns (address lpToken,  uint256,  uint256,  uint256,  uint256,  uint256,  uint16,  uint16)"

async function pool2(api) {
  const pools = (await getStakingPools(api.chain, 'pool2'))
  const tokensAndOwners = pools.map((v, i) => ([v.lpAddress, v.contractAddress]))
  return sumUnknownTokens({ api, tokensAndOwners, blacklist})
}
