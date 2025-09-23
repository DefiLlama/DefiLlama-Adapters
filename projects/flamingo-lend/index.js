const { post } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

const endpoint = 'https://explorer.onegate.space/api'

const whitelistedTokens = new Set([
  '0x68b938cc42b6a2d54fb9040f5facf4290ebb8c5f', '0xd3a41b53888a733b549f5d4146e7a98d3285fa21',
  '0xd2a4cff31913016155e38e474a2c06d08be276cf', '0x4548a3bcb3c2b5ce42bf0559b1cf2f1ec97a51d0',
])


async function getBalances(address) {
  const data = await post(endpoint, {
    "jsonrpc": "2.0", "id": 1, "params":
    {
      "Address": address, "Limit": 10, "Skip": 0

    }, "method": "GetAssetsHeldByAddress"
  })
  return data.result.result
}

async function tvl(api) {
  // https://explorer.onegate.space/accountprofile/0x799bbfcbc97b5a425e14089aeb06753cb3190560
  const accounts = ['0x03217e03834e48ac6b7b0053af23d3663090875a', '0x799bbfcbc97b5a425e14089aeb06753cb3190560']
  for (const account of accounts) {
    const data = await getBalances(account)
    data.forEach(i => {
      if (!whitelistedTokens.has(i.asset.toLowerCase())) return;
      api.add(i.asset, i.balance)
    })
  }
  return sumTokens2({ api })
}

module.exports = {
  neo: { tvl }
}