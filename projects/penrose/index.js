const abi = require("./abi.js");
const partnerRewardsPoolAddress = "0x5DD340DD4142D093c1926282CD56B0D4690dEB11";
const penDystRewardPoolAddress = "0x62f9B938323fb68379B9Ac1641012F9BeE339C69";
const vlPenAddress = "0x55CA76E0341ccD35c2E3F34CbF767C6102aea70f";
const penAddress = "0x9008D70A5282a936552593f410AbcBcE2F891A97";
const penDystAddress = "0x5b0522391d0A5a37FD117fE4C43e8876FB4e91E6";
const dyst = '0x39aB6574c289c3Ae4d88500eEc792AB5B947A5Eb'
const { getUniqueAddresses } = require('../helper/utils')
const { sumTokensExport } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')

async function tvl(api) {
  // 0xDAO Master Chef
  // 0xDAO Core
  const penLensAddress = "0x1432c3553FDf7FBD593a84B3A4d380c643cbf7a2";
  const dystopiaLensAddress = "0xDd688a48A511f1341CC57D89e3DcA486e073eaCe";

  const reserveDataMap = {}

  const poolsData = await api.call({ target: penLensAddress, abi: abi.penPoolsData, })

  const dystopiaPoolsAddresses = getUniqueAddresses(poolsData.map(i => i.poolData.id))
  const reservesData = await api.call({ target: dystopiaLensAddress, params: [dystopiaPoolsAddresses], abi: abi.poolsReservesInfo })
  reservesData.forEach(i => reserveDataMap[i.id.toLowerCase()] = i)

  poolsData.forEach(pool => {
    const ratio = pool.totalSupply / pool.poolData.totalSupply
    const reserves = reserveDataMap[pool.poolData.id.toLowerCase()]
    if (!reserves) throw new Error('Missing data', pool.poolData.id)
    const { token0Address, token0Reserve, token1Address, token1Reserve } = reserves
    api.add(token0Address, +token0Reserve * ratio)
    api.add(token1Address, +token1Reserve * ratio)
  })

  // Add DYST in penDYST
  const supply = await api.call({ abi: 'erc20:totalSupply', target: penDystAddress })
  api.add(dyst, supply)

  return api.sumTokens([
    [dyst, penDystRewardPoolAddress],
    [dyst, partnerRewardsPoolAddress],
  ])
}


module.exports = {
  polygon: {
    tvl,
    staking: sumTokensExport({
      tokensAndOwners: [
        [penAddress, vlPenAddress],
        [penAddress, partnerRewardsPoolAddress],
        [penAddress, penDystRewardPoolAddress],
      ]
    }),
  }
}
