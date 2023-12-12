const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const { getShareValues, serializeTvl, WALLET_staking, WALLET } = require('./helpers.js')
const ethereumEligibleAssets = require('./eligibleAssets').ethereum
const ambireTVLContracts = require('./ambireTVLContracts')

async function ethTvl(timestamp, block) {
  const shareValues = await getShareValues()
  const nativeBalances = await sdk.api.eth.getBalances({
    targets: ambireTVLContracts
  })

  const calls = ambireTVLContracts.map(contract => {
    return ethereumEligibleAssets.map(assetAddr => ({
      target: assetAddr,
      params: contract
    }))
  }).flat()

  const balance = await sdk.api.abi.multiCall({
    calls: calls,
    abi: 'erc20:balanceOf',
    block,
    chain: 'ethereum'
  })
  return serializeTvl(balance, nativeBalances, shareValues)
}

module.exports = {
  methodology: `The Ambire TVL consists of all eligible tokens locked in Ambire contracts. $WALLET rewards are distributed based on this number.`, 
  ethereum:{
    tvl: ethTvl,
    staking: sdk.util.sumChainTvls([
      staking(WALLET_staking, WALLET, 'ethereum')
    ]), 
  }
}