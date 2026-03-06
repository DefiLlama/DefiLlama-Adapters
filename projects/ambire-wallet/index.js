const { staking } = require('../helper/staking')
const sdk = require('@defillama/sdk')

const WALLET = '0x88800092ff476844f74dc2fc427974bbee2794ae'
const WALLET_staking = '0x47cd7e91c3cbaaf266369fe8518345fc4fc12935'

module.exports = {
  methodology: `TVL for Ambire Wallet consists of the staking of WALLET.`, 
  ethereum:{
    tvl: () => ({}),
    staking: sdk.util.sumChainTvls([
      staking(WALLET_staking, WALLET), 
    ]), 
  }
}