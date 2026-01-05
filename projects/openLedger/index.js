const { staking } = require('../helper/staking')
const ADDRESSES = require('../helper/coreAssets.json')

const TOKEN = "0xA227Cc36938f0c9E09CE0e64dfab226cad739447"
const OCTO = "0xC4B6A514449375eD2208E050540dBDf0dCAdA619"

//same hex, different chains
const ETH_STAKING = "0xaDB85bDF08E492E9B62B0d0F705113d1E379ED85"
const BNB_STAKING = "0xaDB85bDF08E492E9B62B0d0F705113d1E379ED85"

// openLedger chain - AI studio
const OPEN_STUDIO_VAULT = "0xF8Cc9204543Bc0CBf289c7af5AD7E28441529150"

module.exports = {
  ethereum: {
    tvl: () => ({}),
    staking: staking([OCTO, ETH_STAKING], TOKEN),
  },
  bsc: {
    tvl: () => ({}),
    staking: staking(BNB_STAKING, TOKEN),
  },
  open: {
    tvl: () => ({}),
    staking: staking(OPEN_STUDIO_VAULT, ADDRESSES.null),
  },
}