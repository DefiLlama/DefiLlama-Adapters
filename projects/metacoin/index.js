const { getLogs } = require('../helper/cache/getLogs')
const { sumTokens2 } = require('../helper/unwrapLPs')

const exchangeAddr = '0x1dd2235091c82862bcc7e9c25017ba9c409c0820'
const vaultAddr = '0x1ac269102c4d8c4f92b3cf9d214ea78060b4d366'

async function tvl(api) {
  const logs = await getLogs({
    api,
    target: exchangeAddr,
    topic: 'TokenRegistrationConfirmed(address,string,uint8)',
    eventAbi: 'event TokenRegistrationConfirmed(address indexed assetAddress, string assetSymbol, uint8 decimals)',
    onlyArgs: true,
    fromBlock: 16594995,
  })
  const tokens = logs.map(i => i.assetAddress)
  return sumTokens2({ tokens, api, owners: [vaultAddr]})
}

module.exports = {
  bsc: { tvl }
}