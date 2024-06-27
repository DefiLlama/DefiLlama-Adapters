const abi = require("../helper/abis/morpho.json");
const { mergeExports } = require("../helper/utils")
const ADDRESSES = require("../helper/coreAssets.json")
const { yieldHelper, } = require("../helper/yieldHelper")

const getMetrics = async (api, borrowed) => {
  const morphoCompoundMainnetLens = '0x67A9de639760bE73C4A9EecE303942ff25a0144d'
  const markets = await api.call({ target: morphoCompoundMainnetLens, abi: abi.morphoLens.getAllMarkets, });
  const underlyings = (await api.multiCall({ abi: abi.cToken.underlying, calls: markets, permitFailure: true })).map(i => i ?? ADDRESSES.null)
  const balancesTotalBorrow = await api.multiCall({ calls: markets, target: morphoCompoundMainnetLens, abi: abi.morphoLens.getTotalMarketBorrow })
  const multiplier = borrowed ? 1 : -1
  api.add(underlyings, balancesTotalBorrow.map(b => b.poolBorrowAmount * multiplier))
  api.add(underlyings, balancesTotalBorrow.map(b => b.p2pBorrowAmount * multiplier))

  if (!borrowed) {
    const balancesTotalSupply = await api.multiCall({ calls: markets, target: morphoCompoundMainnetLens, abi: abi.morphoLens.getTotalMarketSupply })
    api.add(underlyings, balancesTotalSupply.map(b => b.poolSupplyAmount))
    api.add(underlyings, balancesTotalSupply.map(b => b.p2pSupplyAmount))

  }

  return api.getBalances()
}

const fetchTvl = (borrowed) => {
  return async (api) => {
    return getMetrics(api, borrowed)
  }
}

const contract = '0x2c7674027e7f1A9ba7e7d107Ad33EAb3ee7948c2'
const token = '0x17ffD1D55A5D9D73f6a337aA35109a63B405dE21'
const abis = {
  poolInfo: 'function poolInfo(uint256) view returns (address want, uint256 allocPoint, uint256 lastRewardTime, uint256 accSushiPerShare, uint256 amount)',
}
const getTokenBalances = ({ api, poolInfos, poolIds }) => {
  let balances = []
  for (const info of poolInfos)
    balances.push(info.amount)
  return balances
}

const hakura_helper = yieldHelper({
  project: 'hakura',
  chain: 'optimism',
  masterchef: contract,
  nativeToken: token,
  abis,
  poolFilter: i => i,
  getTokenBalances
})

module.exports = mergeExports([
  hakura_helper,
  {
    optimism: {
      tvl: fetchTvl(false),
      borrowed: fetchTvl(true),
    }
  }
])
