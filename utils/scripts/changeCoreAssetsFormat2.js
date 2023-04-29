const assets = require("../../projects/helper/coreAssets.json");
const fs = require('fs')
const axios = require('axios')

const sdk = require('@defillama/sdk')
const newJson = {}

async function run() {
  const entries = Object.entries(assets)
  for (const entry of entries) {
    await getSymbols(entry)
    fs.writeFileSync('./projects/helper/coreAssets.json', JSON.stringify(newJson, null, 2))
  }
}

async function updateNames([chain, addresses]) {
  if (!addresses.length) return;
  const chainObj = {}
  newJson[chain] = chainObj
  if (!addresses[addresses.length -1].startsWith('0x') || ['starknet', 'aptos'].includes(chain)) {
    addresses.forEach((v, i) => {
      const key = 'temp_' + i
      chainObj[key] = v
    })
    console.log('------- non-evm chain: ', chain)
    return;
  }
  const symbols = await api.multiCall({  abi: 'string:symbol', calls: addresses, permitFailure: true})
  addresses.forEach((v, i) => {
    let key = symbols[i]
    if (!key) {
      key = v === '0x0000000000000000000000000000000000000000' ? 'null' : 'temp_' + i
    }
    key = key.replace(/\W+/g, '_')
    chainObj[key] = v
  })
}

async function getSymbols([chain, mapping]) {
  newJson[chain] = mapping
  let reverseMapping = {}
  const tokens = Object.entries(mapping).map(([key, value]) => {
    if (!key.startsWith('temp_')) return;
    const key2 = chain + ':'+value
    reverseMapping[key2] = key
    return key2
  }).filter(i => i)
  if (!tokens.length) return;
  console.log('for ', chain, tokens)
  const { data: { coins }} = await axios.get('https://coins.llama.fi/prices/current/'+tokens.join(','))
  const symbolSet = new Set()
  Object.entries(coins).forEach(([key, { symbol }]) => {
    const key2 = reverseMapping[key]
    if (!key2) {
      console.log('Bug: ',key, chain)
      throw new Error('Fix this')
    }
    const value = mapping[key2]
    delete mapping[key2]
    let iterator = 0
    let label = symbol
    while (symbolSet.has(label)) {
      label = symbol + '_'+ ++iterator
    }
    symbolSet.add(label)
    mapping[label] = value
  })
  
}

run().then(() => {
  console.log('done')
  process.exit(0)
}) 