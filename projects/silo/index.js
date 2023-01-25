const sdk = require('@defillama/sdk')
const { sumTokens2 } = require('../helper/unwrapLPs')
const { getLogs } = require('../helper/cache/getLogs')
const getAssetsAbi = "address[]:getAssets"

const getAssetStateAbi = 'function getAssetsWithState() view returns (address[] assets, tuple(address collateralToken, address collateralOnlyToken, address debtToken, uint256 totalDeposits, uint256 collateralOnlyDeposits, uint256 totalBorrowAmount)[] assetsStorage)'

const START_BLOCK = 15307294
const SILO_FACTORY = '0x4D919CEcfD4793c0D47866C8d0a02a0950737589'

async function tvl(_, block, _1, { api }) {

  const siloArray = await getSilos(api)
  const { output: assets } = await sdk.api.abi.multiCall({
    abi: getAssetsAbi,
    calls: siloArray.map(i => ({ target: i})),
    block,
  })

  const toa = assets.map(i => i.output.map(j => [j, i.input.target])).flat()
  return sumTokens2({ block, tokensAndOwners: toa, })
}

async function borrowed(_, block, _1, { api }) {
  const balances = {}
  const siloArray = await getSilos(api)
  const { output: assetStates } = await sdk.api.abi.multiCall({
    abi: getAssetStateAbi,
    calls: siloArray.map(i => ({ target: i})),
    block,
  });
  assetStates.forEach(({ output: { assets, assetsStorage}}) => {
    assetsStorage.forEach((i, j) => sdk.util.sumSingleBalance(balances, assets[j], i.totalBorrowAmount))
  })

  return balances
}

let silos

async function getSilos(api) {
  if (!silos) silos = _getSilos()
  return silos

  async function _getSilos() {
    const logs = (
      await getLogs({
        api,
        target: SILO_FACTORY,
        fromBlock: START_BLOCK,
        topic: 'NewSiloCreated(address,address,uint128)',
      })
    )
  
    return logs.map((log) => `0x${log.topics[1].substring(26)}`)
  }
}


module.exports = {
  ethereum: { tvl, borrowed, },
  hallmarks: [
    [1668816000, "XAI Genesis"]
  ]
}