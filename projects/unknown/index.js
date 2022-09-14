const abi = require("./abi.js");
const partnerRewardsPoolAddress = "0x4D0EDfd1899Fa15f21e3BBE9588CE71816BD189C";
const unConeRewardPoolAddress = "0x6C4387C90CF36C9ddf55EeB7410daaD95096B547";
const vlUnknwnAddress = "0xc81CaBd33F810118972A63cb66ccd373E9E0C4Ea";
const unkwnAddress = "0xD7FbBf5CB43b4A902A8c994D94e821f3149441c7";
const unCONEAddress = "0xE75B36e5fdaA10c885a2D429F3B95d9b2De9F946";
const cone = '0xA60205802E1B5C6EC1CAFA3cAcd49dFeECe05AC9'
const { getChainTransform } = require('../helper/portedTokens')
const { getUniqueAddresses } = require('../helper/utils')
const { sumTokensExport, getTokenPrices, } = require('../helper/unknownTokens')
const { sumTokens } = require('../helper/unwrapLPs')
const sdk = require('@defillama/sdk')
const { default: BigNumber } = require('bignumber.js')
const chain = 'bsc'

const lps = [
  '0xd8a928623224d83174811fb105d64c46462c438f', // UNKNOWN/BNB
  '0x672cD8201CEB518F9E42526ef7bCFe5263F41951', // CONE/BNB
]

async function tvl(time, ethBlock, { [chain]: block }) {
  // 0xDAO Master Chef
  const balances = {}
  const transformAddress = await getChainTransform(chain)
  // 0xDAO Core
  const unkwnLensAddress = "0x5b1cEB9adcec674552CB26dD55a5E5846712394C";
  const coneLensAddress = "0xe2006DFB1363330AD81BcEBee7bE45A7692fC53f";

  const reserveDataMap = {}

  const { output: poolsData } = await sdk.api.abi.call({
    block,
    chain: 'bsc',
    target: unkwnLensAddress,
    abi: abi.penPoolsData,
  })

  const conePoolsAddresses = getUniqueAddresses(poolsData.map(i => i.poolData.id))
  const { output: reservesData } = await sdk.api.abi.call({
    block,
    chain: 'bsc',
    target: coneLensAddress,
    params: [conePoolsAddresses],
    abi: abi.poolsReservesInfo
  })
  reservesData.forEach(i => reserveDataMap[i.id.toLowerCase()] = i)

  poolsData.forEach(pool => {
    const ratio = pool.totalSupply / pool.poolData.totalSupply
    const reserves = reserveDataMap[pool.poolData.id.toLowerCase()]
    if (!reserves) throw new Error('Missing data', pool.poolData.id)
    const { token0Address, token0Reserve, token1Address, token1Reserve } = reserves
    sdk.util.sumSingleBalance(balances, transformAddress(token0Address), BigNumber(+token0Reserve * ratio).toFixed(0))
    sdk.util.sumSingleBalance(balances, transformAddress(token1Address), BigNumber(+token1Reserve * ratio).toFixed(0))
  })

  // Add DYST in penDYST
  const { output: uConeSupply} = await sdk.api.erc20.totalSupply({ target: unCONEAddress, chain, block })
  sdk.util.sumSingleBalance(balances, transformAddress(cone), uConeSupply)

  await sumTokens(balances, [
    [cone, unConeRewardPoolAddress],
    [cone, partnerRewardsPoolAddress],
  ], block, chain)
  const { updateBalances } = await getTokenPrices({ chain, block, useDefaultCoreAssets: true, lps, allLps: true })
  return updateBalances(balances)
}

module.exports = {
  misrepresentedTokens: true,
  bsc: {
    tvl,
    staking: sumTokensExport({ tokensAndOwners: [
      [unkwnAddress, vlUnknwnAddress],
      [unkwnAddress, partnerRewardsPoolAddress],
      [unkwnAddress, unConeRewardPoolAddress],
    ], chain: 'bsc', lps, useDefaultCoreAssets: true, }),
  }
}
