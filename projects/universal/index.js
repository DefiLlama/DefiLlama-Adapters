const { sleep } = require('../helper/utils')

async function tvl(api) {
  // we do this because sometimes api returns invalid JSON data with random characters inside
  let balances = null;
  do {
    try {
      const {data: reserves} = await fetch("https://proof.universal.xyz/balances", {"method": "GET"}).then(r=>r.json())

      const rawdata = reserves[0].proof.extractedParameterValues.data

      // Handle cases with no body
      const body = rawdata.split('\r\n\r\n', 2)[1] || ''

      let balancesString = ''
      for (let i = 0; i < body.length; i++) {
        if (body[i] === '{') {
          balancesString = body.slice(i, -1)
          break
        }
      }

      balances = JSON.parse(balancesString)

      for (const balance of balances.balances) {
        api.addUSDValue(Number(balance.fiat_amount))
      }

      return api.getBalances()
    } catch(e) {
      balances = null
    }

    await sleep(10000)
  } while(balances === null)
}

module.exports = {
  methodology: "Total backing assets for uAssets are custodied by Coinbase Prime with proof generated from Universal API and verifiable using Reclaim Protocol's zkTLS",
  timetravel: false,
  ethereum: {
    tvl
  }
};