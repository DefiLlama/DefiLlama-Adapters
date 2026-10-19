const { post } = require('../helper/http')

const RPC = 'https://n3seed1.ngd.network:10332'

// lending contracts, e.g. https://explorer.onegate.space/accountprofile/0x799bbfcbc97b5a425e14089aeb06753cb3190560
const accounts = ['0x03217e03834e48ac6b7b0053af23d3663090875a', '0x799bbfcbc97b5a425e14089aeb06753cb3190560']

const tokens = [
  '0x68b938cc42b6a2d54fb9040f5facf4290ebb8c5f', '0xd3a41b53888a733b549f5d4146e7a98d3285fa21',
  '0xd2a4cff31913016155e38e474a2c06d08be276cf', '0x4548a3bcb3c2b5ce42bf0559b1cf2f1ec97a51d0',
]

async function balanceOf(token, account) {
  const { result } = await post(RPC, {
    jsonrpc: '2.0', id: 1, method: 'invokefunction',
    params: [token, 'balanceOf', [{ type: 'Hash160', value: account }]],
  })
  if (result.state !== 'HALT') throw new Error(`${token}.balanceOf(${account}) failed: ${result.exception}`)
  return result.stack[0].value
}

async function tvl(api) {
  for (const account of accounts)
    for (const token of tokens)
      api.add(token, await balanceOf(token, account))
}

module.exports = {
  timetravel: false,
  methodology: 'Balances of the supported collateral and lending tokens held by the Flamingo Lend contracts, read on-chain from a Neo N3 node.',
  neo: { tvl },
}
