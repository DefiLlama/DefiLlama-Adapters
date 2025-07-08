const assets = require("../../projects/helper/coreAssets.json");
const fs = require('fs')
const axios = require('axios')

const newJson = {}

async function run() {
  const entries = Object.entries(assets)
  await Promise.all(entries.map(checkSymbols))
  // for (const entry of entries) {
  //   await getSymbols(entry)
  //   fs.writeFileSync('./projects/helper/coreAssets.json', JSON.stringify(newJson, null, 2))
  // }
  // for (const entry of entries) {
  //   await checkSymbols(entry)
  // }
}

async function getSymbols([chain, mapping]) {
  newJson[chain] = mapping
  let reverseMapping = {}
  const tokens = Object.entries(mapping).map(([key, value]) => {
    if (!key.startsWith('temp_')) return;
    const key2 = chain + ':' + value
    reverseMapping[key2] = key
    return key2
  }).filter(i => i)
  if (!tokens.length) return;
  const { data: { coins } } = await axios.get('https://coins2.llama.fi/prices/current/' + tokens.join(','))
  const symbolSet = new Set()
  Object.entries(coins).forEach(([key, { symbol }]) => {
    const key2 = reverseMapping[key]
    if (!key2) {
      console.log('Bug: ', key, chain)
      throw new Error('Fix this')
    }
    const value = mapping[key2]
    delete mapping[key2]
    let iterator = 0
    let label = symbol
    while (symbolSet.has(label)) {
      label = symbol + '_' + ++iterator
    }
    symbolSet.add(label)
    mapping[label] = value
  })

}

async function checkSymbols([chain, mapping]) {
  try {
    if (chain === 'null') return;
    newJson[chain] = mapping
    let tokens = Object.entries(mapping).map(([key, value]) => {
      return chain + ':' + value
    })
    if (!tokens.length) return;
    const { data: { coins } } = await axios.get('https://coins2.llama.fi/prices/current/' + tokens.join(','))
    Object.entries(coins).forEach(([key, { symbol }]) => {
      tokens = tokens.filter(i => i !== key)
    })
    if (tokens.length) console.log('failed to find price:', chain, tokens)
  } catch (e) {
    console.log('error in ', chain)
  }
}

run().then(() => {
  console.log('done')
  process.exit(0)
}) 