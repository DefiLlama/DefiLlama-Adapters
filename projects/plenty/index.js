const axios = require('axios')
const { getTokenBalances, sumTokens, convertBalances } = require('../helper/tezos')
const { getFixBalances } = require('../helper/portedTokens')

async function tvl() {
  let balances = await sumTokens({ owners: await getDexes(), includeTezos: true, })
  const fixBalances = await getFixBalances('tezos')
  balances = await convertBalances(balances)
  fixBalances(balances)
  return balances
}

async function staking() {
  const fixBalances = await getFixBalances('tezos')
  const stakingAddress = 'KT1PxkrCckgh5fA5v2cZEE2bX5q2RV1rv8dj'
  const balances = await getTokenBalances(stakingAddress, false)
  fixBalances(balances)
  return balances
}

async function getDexes() {
  // We take ts file and use regex to convert it to JSON and parse it (Yes, seriously)
  const { data } = await axios.get('https://raw.githubusercontent.com/Plenty-DeFi/plenty-interface/master/src/config/config.ts')

  const a = data.slice(data.indexOf(': IConfig')) // find start of config file

  let text = a.slice(a.indexOf('{'), a.lastIndexOf('}') + 1) // find first { and last } and get all data in between
  text = text.split('\n')  //remove all comment lines 
  text = text.map(i => {
    if (i.includes('// ')) return i.slice(0, i.indexOf('// '))
    if (i.includes(' //')) return i.slice(0, i.indexOf(' //'))
    return i
  }).join('\n')
  text = text.replace(/\,(\s*[\}\]])/g, '$1')  // remove trailing commas
  text = text.replace(/\'/g, '"')  // convert single quotation to double
  text = text.replace(/(\s?)(\w+)\s*\:([^\/])/g, '$1"$2":$3') // cover keys with qoutes, eg. key1: "value" -> "key1":"value"
  const config = JSON.parse(text)
  const dexSet = new Set()
  Object.values(config.AMM.mainnet).forEach(t => {
    Object.values(t.DEX_PAIRS || {}).forEach(pair => {
      dexSet.add(pair.contract)
    })
  })
  const dexes = [...dexSet]
  return dexes
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  tezos: {
    staking,
    tvl,
  },
}