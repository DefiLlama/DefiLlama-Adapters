const { function_view } = require('../helper/chain/aptos')
const ADDRESSES = require('../helper/coreAssets.json')

const TRUSTAKE_APT_CONTRACT_ADDR = "0x6f8ca77dd0a4c65362f475adb1c26ae921b1d75aa6b70e53d0e340efd7d8bc80"
const MODULE = "staker"
const FUNCTION = "total_staked"

async function tvl(api) {
  const totalStaked = await function_view({ functionStr: `${TRUSTAKE_APT_CONTRACT_ADDR}::${MODULE}::${FUNCTION}` })
  api.add(ADDRESSES.aptos.APT, totalStaked[0])
}

module.exports = {
  methodology: `Counts the TVL of APT tokens in TruFin's TruStake APTOS vault.`,
  aptos: {
    tvl
  }
}