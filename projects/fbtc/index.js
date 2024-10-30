const { getConfig } = require('../helper/cache')
const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')

const abi = {
  getQualifiedUserInfo: 'function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)',
}
async function tvl() {
  const staticAddresses = await getConfig('fbtc', undefined, {
    fetcher: async () => {
      const token = getEnv('FBTC_ACCESS_TOKEN')
      const { result } = await get('https://fbtc.phalcon.blocksec.com/api/v1/extension/fbtc-reserved-addr', {
        headers: {
          'access-token': token
        }
      })
      return result.map(r => r.address)
    }
  })
  const api = new sdk.ChainApi({ chain: 'ethereum' })
  const users = await api.call({ abi: 'address[]:getQualifiedUsers', target: '0xbee335BB44e75C4794a0b9B54E8027b111395943' })
  const userInfos = await api.multiCall({ abi: abi.getQualifiedUserInfo, target: '0xbee335BB44e75C4794a0b9B54E8027b111395943', calls: users })
  userInfos.forEach(i => staticAddresses.push(i.depositAddress))
  return sumTokens({ owners: staticAddresses })
}

module.exports = {
  timetravel: false,
  bitcoin: {
    tvl,
  }
}
