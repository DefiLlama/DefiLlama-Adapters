const axios = require('axios')
const retry = require('async-retry')
const sdk = require('@defillama/sdk')
const BigNumber = require("bignumber.js")
const { toUSDTBalances } = require('../helper/balances')

async function tvl() {
  const balances = {
    value: BigNumber(0)
  }

  // V1
  let vaults = (await retry(
    async (bail) =>
      await axios.get(
        'https://app.enzyme.finance/api/v1/vault-list?network=ethereum'
      )
  )).data.map(v => v.id)

  const pageSize = 10
  const pageCount = vaults.length / pageSize

  for (let i = 0; i <= pageCount ; i++) {
    const items = vaults.slice(pageSize * i, pageSize * (i + 1))
    await Promise.all(items.map(address => addAllTokens(address, balances)))
    
    await delay(2000)
  }

  return toUSDTBalances(balances.value)
}

async function addAllTokens(address, balances = {}) {
  let tokens = (
    await axios.get(
      `https://api.covalenthq.com/v1/1/address/${address}/balances_v2/?&key=ckey_72cd3b74b4a048c9bc671f7c5a6`
    )
  ).data.data.items

  tokens
    .forEach(({ contract_address: token, balance, contract_decimals: decimals, quote_rate: price, }) => {
      if (!balance || !decimals || !price || !token) return;
      const bigNumber = BigNumber(balance).shiftedBy(-1 * decimals).multipliedBy(price)
      if (bigNumber.toFixed(2) > 10 ** 7) {
        return; // Ignoring values that return more than 10 Million
      }
      balances.value  = bigNumber.plus(balances.value)
    })
  return balances
}

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  })
}

module.exports = {
  ethereum: {
    tvl
  }
}