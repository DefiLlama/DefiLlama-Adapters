const sdk = require('@defillama/sdk')
const WALLET = '0x88800092fF476844f74dC2FC427974BBee2794Ae'
const WALLET_staking = '0x47Cd7E91C3CBaAF266369fe8518345fc4FC12935'
const ADEX = '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'
const ADEX_staking = '0xB6456b57f03352bE48Bf101B46c1752a0813491a'
const stakingTokensMapping = {
  [WALLET_staking]: WALLET,
  [ADEX_staking]: ADEX
}
const ADDRESSES = require('../helper/coreAssets.json')

function serializeTvl (erc20Balance, nativeBalances, shareValues) {
    const tvl = {}

    erc20Balance.output.map(item => {
      const asset = stakingTokensMapping[item.input.target] || item.input.target
      const sharedValueMultiple = shareValues[item.input.target] || 1
  
      if (!tvl[asset]) {
        tvl[asset] = (item.output * sharedValueMultiple)
      } else {
        tvl[asset] += (item.output * sharedValueMultiple)
      }
    })
  
    tvl[ADDRESSES.null] = nativeBalances.output.reduce((a,b) => {
      return parseInt(a.balance) ? parseInt(a.balance) + parseInt(b.balance) : a + parseInt(b.balance)
    }, 0)
  
    return tvl
}

async function getShareValues (){
    const sharedValues = await sdk.api.abi.multiCall({
      calls: [
        {
          target: WALLET_staking,
          params: []
        },
        {
          target: ADEX_staking,
          params: []
        }
      ],
      abi: 'function shareValue() external view returns (uint)',
      chain: 'ethereum'
    })
    const shareValues = {
      [WALLET_staking]: parseInt(sharedValues.output[0].output) / 1e18,
      [ADEX_staking]: parseInt(sharedValues.output[1].output) / 1e18
    }
    return shareValues
  }
  

module.exports = {
  serializeTvl,
  getShareValues,
  WALLET,
  WALLET_staking,
  ADEX,
  ADEX_staking,
  stakingTokensMapping
}