const { getConfig } = require("../helper/cache");
const { get } = require("../helper/http");
const { sumTokens2, } = require("../helper/unwrapLPs");

const wantLockedTotalABI = "uint256:wantLockedTotal"

let _pools

async function getPools(api) {
  if (!_pools) _pools = getConfig('crystl', undefined, { fetcher: _getPools })
  let p = (await _pools).filter(i => +i.chainId === api.chainId)
  const pObject = p.reduce((acc, i) => ({ ...acc, [i.strategyAddress]: i }), {})
  return Object.values(pObject)

  async function _getPools() {
    const poolsResponse = await Promise.all([
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/vaults/vaults.json',
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/vaults/vaultsV3.json',
      'https://raw.githubusercontent.com/polycrystal/crystl-config/main/pools/boostPools.json',
    ].map(get))

    const pools = poolsResponse.flat()

    pools.forEach(i => {
      if (!i.strategyAddress) i.strategyAddress = i.stratAddress
      if (!i.wantAddress) i.wantAddress = i.wantTokenAddress
    })
    return pools
  }
}

async function tvl(api) {
  const pools = await getPools(api)
  const tokens = pools.map(i => i.wantAddress)
  const totals = await api.multiCall({ abi: wantLockedTotalABI, calls: pools.map(i => i.strategyAddress), })
  api.add(tokens, totals)
  await sumTokens2({ api, resolveLP: true })
}

module.exports = {
  hallmarks: [
    [1656590400, "Protocol End"] // https://crystlfinance.medium.com/wrapping-up-crystl-finance-4743287a6bf
  ],
  polygon: {
    tvl,
  },
  cronos: {
    tvl,
  },
  bsc: {
    tvl,
  },
  methodology:
    "Our TVL is calculated from the Total Value Locked in our Vaults, Farms, and Pools.",
};
