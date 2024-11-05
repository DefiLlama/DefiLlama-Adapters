const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const abi = {
  getQualifiedUserInfo: 'function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)',
}

async function tvl() {
  const staticAddresses = await bitcoinAddressBook.fbtc()
  const api = new sdk.ChainApi({ chain: 'ethereum' })
  const users = await api.call({ abi: 'address[]:getQualifiedUsers', target: '0xbee335BB44e75C4794a0b9B54E8027b111395943' })
  const userInfos = await api.multiCall({ abi: abi.getQualifiedUserInfo, target: '0xbee335BB44e75C4794a0b9B54E8027b111395943', calls: users })
  userInfos.forEach(i => staticAddresses.push(i.depositAddress))
  return sumTokens({ owners: staticAddresses })
}

module.exports = {
  timetravel: false,
  bitcoin: { tvl }
}
