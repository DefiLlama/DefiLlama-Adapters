const { sumTokens } = require('../helper/chain/bitcoin')
const sdk = require('@defillama/sdk')

const staticAddresses = [
  // https://docs.fbtc.com/security/bitcoin-reserve-address
  'bc1q7jgulg69frc8zuzy0ng8d5208kae7t0twyfjwm',
  'bc1q6c3c0t3zvnphce37ufr4yz9veaqvew2wg0shwr',
  '3HjNJWcn2ayFLikzmKRaFtcbLufYChQo3T',
  '374vhN24WryvNWUUZR2uDAnL4oNP5EW4qR',

  'bc1qr5nz7n8ulcdz0w3s6fska80fawxhvqlh273qypm3rkjequ9wpmhs65ppw7',
  'bc1qhu98nf6ddz6ja73rn72encdr8ezsyhexwpdzap0vcs7lg2wpmrnq5ygfsl',
  'bc1qg6asmzjr7nr5f5upg3xqyrdxl2tq8ef58hha7t0s82mzzx6zjxesyccp4h',
  'bc1qxe3md4lehg8gmrlx3e8xqju5mytt266l4hcy8khl6tm5mahghmeqtxlgqq',
  'bc1qy48h0kuv0r3e330wjfs6r74sk49pkzumnm907t5mhqjxml22r3ss2ucuxc',

  '32DgQPVHSV6FSxLnw68nggvchp3ZNKquxA',
  'bc1qj9w5ee2kf4akvtzrj59p77yc6x02nqqg9m0tcd',
  'bc1q6w7dn3fkky587a2qwxp6swyhlwgueh2ew26zem',
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
