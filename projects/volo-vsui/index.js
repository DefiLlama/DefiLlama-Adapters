const sui = require('../helper/chain/sui')
const axios = require('axios')

const VAULTS = [
  { address: '0x6e53ffe5b77a85ff609b0813955866ec98a072e4aaf628108e717143ec907bd8', gecko_id: 'bitcoin' },
  { address: '0x041b49dc6625e074f452b9bc60a9a828aebfbef29bcba119ad90a4b11ba405bf', gecko_id: 'okx-wrapped-btc' },
  { address: '0xa97cc9a63710f905deb2da40d6548ce7a75ee3dfe4be0c1d553553d2059c31a3', gecko_id: 'usd-coin' },
  { address: '0x27936e146ec8c695d14a3b900d21a495d2396c0a99e3c6766f86d15fe91d3897', gecko_id: 'usd-coin' },
]

const ENDPOINT = 'https://vault-api.volosui.com/api/v1/vaults'

const getVaults = async (api) => {
  const { data } = await axios.get(ENDPOINT)
  const vaults = data.data

  for (const { id, totalStaked } of vaults) {
    const match = VAULTS.find(v => v.address.toLowerCase() === id.toLowerCase())
    if (match) api.addCGToken(match.gecko_id, totalStaked)
  }
}

const getStakingTvl = async (api) => {
  const obj = await sui.getObject('0x2d914e23d82fedef1b5f56a32d5c64bdcc3087ccfea2b4d6ea51a71f587840e5')
  const totalSuiSupply = +obj.fields.validator_pool.fields.total_sui_supply
  api.add('0x2::sui::SUI', totalSuiSupply)
}

const tvl = async (api) => {
  await getStakingTvl(api)
  await getVaults(api)
}

module.exports = {
  methodology: "Calculates the amount of SUI staked in Volo liquid staking contracts and tokens in Volo vaults. TVL includes LST (Liquid Staking) and all vault types combined.",
  misrepresentedTokens: true,
  sui: { tvl }
}