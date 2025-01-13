const { sumTokens2 } = require('../helper/unwrapLPs')

const contract = '0x5753fBeC29De6E2b56F73f7d7786e9f0d34897bb'

async function tvl(api) {
  return sumTokens2({ api, owner: contract, fetchCoValentTokens: true })
}

module.exports = {
  sophon: {
    tvl,
    start: 810461,
  },
  methodology: 'Counts all ERC20 token balances in the Sophon Farm contract'
}
