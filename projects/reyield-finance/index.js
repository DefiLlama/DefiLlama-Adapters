const sdk = require("@defillama/sdk");
const ABI = require('./abi.json')
let coreAssets = require('../helper/coreAssets.json')
const BigNumber = require("bignumber.js");

const positionManagerFactory = "0x3332Ae0fC25eF24352ca75c01A1fCfd9fc33EAca"
const positionHelper = "0x76136A56963740b4992C5E9dA5bB58ECffC92ce3"

async function tvl(chain, api) {

  const block = await api.getBlock()
  console.log("chain: "+ chain + " block: " +block)
  const balances = {}

  const pms = await api.call({
    target: positionManagerFactory,
    abi: ABI.getPositionManagers,
    params: [0,1000000],
    chain, block,
  })

  const positionIdCounters = await api.multiCall({
    abi: ABI.positionIdCounter,
    calls: pms.managers.map(i => ({ target: i })),
    chain, block,
  })

  let ownerList = await api.multiCall({
    abi: ABI.getOwner,
    calls: pms.managers.map(i => ({ target: i })),
    chain, block,
  })

  let totalTvl = new BigNumber(0)
  for (let i = 0; i < ownerList.length; i++) {
    let managerTvl = new BigNumber(0)
    for (let j = 1; j <= positionIdCounters[i]; j++) {

      let isPositionRunning = await api.call({
        target: pms.managers[i],
        abi: ABI.isPositionRunning,
        params: [j],
        chain, block,
      })

      if (!isPositionRunning) {
        continue
      }

      let liquidity = await api.call({
        target: positionHelper,
        abi: ABI.getAmounts,
        params: [ownerList[i], j],
        chain, block,
      })

      let uncollected = await api.call({
        target: positionHelper,
        abi: ABI.getUncollectedFees,
        params: [ownerList[i], j],
        chain, block,
      })

      let positionTvl = BigNumber(liquidity.amount0UsdValue).plus(BigNumber(liquidity.amount1UsdValue)).plus(BigNumber(uncollected.amount0UsdValue)).plus(BigNumber(uncollected.amount1UsdValue))
      managerTvl = managerTvl.plus(positionTvl)
    }
    totalTvl = totalTvl.plus(managerTvl)
  }

  sdk.util.sumSingleBalance(balances, `${chain}:${coreAssets[chain].USDC}`, totalTvl);

  return balances 
}

const chains = [
  'optimism',
  'polygon',
]

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  start: 1695873578, // Sep-28-2023 03:59:38 AM +UTC
  doublecounted: true,
  methodology: "TVL is equal to users' running positions' liquidity value plus uncollected fees.",
  hallmarks: [
    [1695874467, "Polygon and Optimism Launch"]
  ],
};

chains.forEach(chain => {
  module.exports[chain] = {
    tvl: async (timestamp, ethBlock, chainBlocks, { api }) => tvl(chain, api),
  }
})
