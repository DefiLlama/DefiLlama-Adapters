
const { post } = require('../helper/http')

const endpoint = 'https://rpc.tangle.tools'

async function fetch(method, params = []) {
  const response = await post(endpoint, { jsonrpc: '2.0', id: 1, method, params })

  console.log(response)

  return response.result
}

async function tvl(api) {
  // balances: totalIssuance()
  const totalIssuance = await fetch('state_getStorage', ['0xc2261276cc9d1f8598ea4b6a74b15c2f57c875e4cff74148e4628f264b974c80'])

  console.debug("Bal", BigInt(totalIssuance).toString())

  api.add("TNT", BigInt(totalIssuance))
}

module.exports = {
  timetravel: false,
  methodology: 'counts the number of MINT tokens in the Club Bonding contract.',
  tTangle: {
    tvl
  }
}