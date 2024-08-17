const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')

const staticAddresses = [
  // https://docs.fbtc.com/security/bitcoin-reserve-address
  'bc1qr5nz7n8ulcdz0w3s6fska80fawxhvqlh273qypm3rkjequ9wpmhs65ppw7',
  'bc1q7jgulg69frc8zuzy0ng8d5208kae7t0twyfjwm',
  'bc1q6c3c0t3zvnphce37ufr4yz9veaqvew2wg0shwr',
  '3HjNJWcn2ayFLikzmKRaFtcbLufYChQo3T',
  '374vhN24WryvNWUUZR2uDAnL4oNP5EW4qR',
]
const abi = {
  getQualifiedUserInfo: "function getQualifiedUserInfo(address _user) view returns ((bool locked, string depositAddress, string withdrawalAddress) info)",
}
async function tvl() {
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