const assets = require("../../projects/helper/coreAssets.json");
const axios = require('axios')

async function run() {
  const entries = Object.entries(assets)
  await Promise.all(entries.map(checkSymbols))
}

async function checkSymbols([chain, mapping]) {
  try {
    if (chain === 'null') return;
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
