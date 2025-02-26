const ADDRESSES = require('../helper/coreAssets.json')
const abi = require("./abi.json");

const USDC = ADDRESSES.arbitrum.USDC;

// Both v1 and v2 factories
const factoryPoolContractsConfig = [
  {
    fromBlock: 1009749,
    contract: '0x98C58c1cEb01E198F8356763d5CbA8EB7b11e4E2',
  },
  {
    fromBlock: 13387522,
    contract: '0x3Feafee6b12C8d2E58c5B118e54C09F9273c6124',
  },
]

async function tvl(api) {
  const owners = []
  for (const { contract } of factoryPoolContractsConfig) {
    const pools = await api.fetchList({  lengthAbi: abi.numPools, itemAbi: abi.pools, target: contract})
    owners.push(...pools)
  }
  return api.sumTokens({ owners, tokens: [USDC] })
}

module.exports = {
  arbitrum: {
    tvl,
  },
  methodology:
    "We count liquidity on the Leveraged Pools through PoolFactory contract",
};
