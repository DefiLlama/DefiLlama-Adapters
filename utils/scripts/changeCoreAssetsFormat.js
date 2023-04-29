const assets = require("../../projects/helper/coreAssets.json");
const fs = require('fs')

const sdk = require('@defillama/sdk')
const newJson = {}

async function run() {
  const entries = Object.entries(assets)
  for (const entry of entries) {
    console.log('for ', entry[0])
    await updateNames(entry)
    fs.writeFileSync('./coreAssets.json', JSON.stringify(newJson, null, 2))
  }
}

async function updateNames([chain, addresses]) {
  const api = new sdk.ChainApi({ chain })
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


run().then(() => {
  console.log('done')
  process.exit(0)
}) 