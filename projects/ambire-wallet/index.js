const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const WALLET = '0x88800092ff476844f74dc2fc427974bbee2794ae'
const WALLET_staking = '0x47cd7e91c3cbaaf266369fe8518345fc4fc12935'
const ADX = '0xADE00C28244d5CE17D72E40330B1c318cD12B7c3'
const ADX_staking = '0xB6456b57f03352bE48Bf101B46c1752a0813491a'

module.exports = {
  methodology: `TVL for Ambire Wallet consists of the staking of WALLET.`, 
  ethereum:{
    tvl: () => ({}),
    staking: sdk.util.sumChainTvls([
      staking(WALLET_staking, WALLET), 
      staking(ADX_staking, ADX)
    ]), 
  }
}